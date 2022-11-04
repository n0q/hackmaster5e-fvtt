import { HMTABLES, HMCONST } from '../sys/constants.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMRollMgr } from '../mgr/rollmgr.js';
import { HMStates } from '../sys/effects.js';

// Remember: Items may not alter Actors under any circumstances.
// You will create a free fire shooting gallery if you do this, and
// we are making Hackmaster, not Aces & Eights.

export class HMItem extends Item {
    static DEFAULT_ICON = HMCONST.DEFAULT_ICON;

    /** @override */
    prepareData(options={}) {
        this.prepareBaseData(options);
        super.prepareEmbeddedDocuments();
        this.prepareDerivedData();
    }

    /** @override */
    prepareBaseData(options={}) {
        super.prepareBaseData();
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
    }

    get quality() {
        const {system} = this;
        const qKey = system?.ranged?.checked ? 'ranged' : this.type;
        const {bonus, qn} = system;
        const values = HMTABLES.quality[qKey].map((a) => a * qn);
        const keys = Object.keys(bonus.total);
        return Object.fromEntries(keys.map((_, i) => [keys[i], values[i]]));
    }

    get specname() {
        const rawName = this.name;
        if (this.type !== 'skill') return rawName;
        const {specialty} = this.system;
        if (specialty.checked && specialty.value.length) return `${rawName} (${specialty.value})`;
        return rawName;
    }

    // HACK: Temporary measure until future inventory overhaul.
    get invstate() {
        // TODO: Migrate
        const state = parseInt(this.system.state, 10) || 0;
        return HMTABLES.itemstate[state];
    }

    onClick(event) {
        const itemType = this.type;
        if (itemType === 'wound') { this.WoundAction(event); }
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const {dataset} = element;
        const itemData = this.system;

        let {hp, timer, treated} = itemData;

        if (dataset.action === 'decTimer') timer--;
        if (dataset.action === 'decHp' || timer < 1) timer = --hp;

        if (hp < 0) return this.delete();
        await this.update({'system': {hp, timer, treated}});
    }

    // TODO: The first half of this function could be a lot neater.
    static async rollSkill({skillName, specialty=null, caller, itemId}) {
        const callers = [];
        if (caller) {
            callers.push({caller, context: caller.items.get(itemId)});
        } else {
            const actors = canvas.tokens.controlled.map((token) => token.actor);
            Object.values(actors).forEach(async (actor) => {
                let context;
                if (specialty) {
                    context = actor.items.find((a) => a.type === 'skill'
                        && skillName === a.name
                        && specialty === a.system?.specialty?.value);
                } else {
                    context = actor.items.find((a) => a.type === 'skill'
                        && skillName === a.name
                        && !a.system?.specialty?.value);
                }
                if (!context) return;
                callers.push({caller: actor, context});
            });
        }
        if (!callers.length) return;

        const dialogDataset = {
            dialog:  'skill',
            itemId:  callers[0].context.id,
            callers: callers.length,
        };

        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dialogDataset, callers[0].caller);

        Object.values(callers).forEach(async (callerObj) => {
            const rollMgr = new HMRollMgr();
            const chatMgr = new HMChatMgr();
            const dataset = {
                dialog: 'skill',
                context: callerObj.context,
                caller:  callerObj.caller,
                resp:    dialogResp.resp,
            };
            dataset.roll = await rollMgr.getRoll(dataset, dataset);
            const card = await chatMgr.getCard({dataset});
            await ChatMessage.create(card);
        });
    }

    static async createItem(item, _options, userId) {
        if (game.user.id !== userId) return;
        const {parent, type} = item;
        if (type !== 'wound') return;

        if (!parent.system.bonus.total.trauma) return;
        const {top} = parent.system.hp;
        const wound = item.system.hp;
        if (!top || top >= wound) return;

        const chatmgr = new HMChatMgr();
        const cardtype = HMCONST.CARD_TYPE.ALERT;
        const dataset = {context: item, top, wound};
        if (parent.type === 'beast') dataset.hidden = true;
        const card = await chatmgr.getCard({cardtype, dataset});
        await ChatMessage.create(card);

        // Auto-roll for beasts.
        if (parent.type === 'beast') {
            dataset.dialog = 'save';
            dataset.formulaType = 'trauma';

            const rollMgr = new HMRollMgr();
            const dialogResp = {caller: parent, context: parent};
            dataset.resp = {caller: parent};

            const roll = await rollMgr.getRoll(dataset, dialogResp);
            const rollMode = 'gmroll';
            dialogResp.resp = {rollMode};
            const topcard = await chatmgr.getCard({dataset, roll, dialogResp});
            await ChatMessage.create(topcard);
        }
    }
}

export async function advanceClock(comData, dialogResp, smartInit=false) {
    const {active}    = game.combats;
    const {combatant} = comData;
    const delta       = Number(dialogResp.resp.advance);
    const oldInit     = smartInit
        ? Math.max(comData.initiative, comData.round)
        : comData.round;
    const newInit     = oldInit + delta;
    active.setInitiative(combatant.id, newInit);

    const initChatData = {
        name: combatant.name,
        hidden: combatant.hidden,
        delta,
        oldInit,
        newInit,
    };

    const cardtype = HMCONST.CARD_TYPE.NOTE;
    const chatMgr = new HMChatMgr();
    const initChatCard = await chatMgr.getCard({cardtype, dataset: initChatData});
    await ChatMessage.create(initChatCard);
}

export async function setStatusEffectOnToken(comData, effect, rounds=null) {
    const {active} = game.combats;
    const {combatant} = comData;
    const combatToken = canvas.scene.tokens.get(combatant.tokenId);
    const duration = rounds ? {
        combat: active.id,
        startRound: active.round,
        rounds,
        type: 'rounds',
        } : null;
    await HMStates.setStatusEffect(combatToken, effect, duration);
}

export async function unsetStatusEffectOnToken(comData, effect) {
    const {combatant} = comData;
    const combatToken = canvas.scene.tokens.get(combatant.tokenId);
    await HMStates.unsetStatusEffect(combatToken, effect);
}
