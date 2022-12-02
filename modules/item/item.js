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
        const state = parseInt(this.system.state, 10) || 0;
        return HMTABLES.itemstate[state];
    }

    static async rollSkill({skillName, specialty=null, caller, itemId}) {
        const callers = [];

        if (caller) callers.push({caller, context: caller.items.get(itemId)});
        else {
            const actors = canvas.tokens.controlled.map((token) => token.actor);
            Object.values(actors).forEach(async (actor) => {
                let context = actor.items.find((a) => a.type === 'skill'
                    && skillName === a.name
                    && specialty === a.system.specialty.value);

                // Unskilled actor.
                if (!context) {
                    const system = deepClone(game.model.Item.skill);
                    system.untrained = true;
                    let specname = skillName;
                    if (specialty) {
                        system.specialty = {checked: true, value: 0};
                        specname += ` (${specialty})`;
                    }
                    context = {name: skillName, specname, system};
                }
                callers.push({caller: actor, context});
            });
        }
        if (!callers.length) return;

        // NOTE: We don't know if it's a language if none of the callers have the skill.
        const dialogCaller = callers.find((a) => a.context._id) ?? callers[0];
        const dialogDataset = {
            dialog: 'skill',
            context: dialogCaller.context,
            callers: callers.length,
        };

        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dialogDataset, dialogCaller.caller);
        const {resp} = dialogResp;

        Object.values(callers).forEach(async (callerObj) => {
            const chatMgr = new HMChatMgr();
            const dataset = {
                dialog: 'skill',
                context: callerObj.context,
                caller:  callerObj.caller,
                resp,
            };

            const formula = HMTABLES.formula.skill[resp.formulaType];
            const {bonus} = callerObj.context.system;
            const rollData = {resp, bonus};
            dataset.roll = await new Roll(formula, rollData).evaluate({async: true});

            const card = await chatMgr.getCard({dataset});
            await ChatMessage.create(card);
        });
    }

    static async createItem(item, _options, userId) {
        if (game.user.id !== userId) return;
        const {parent, type} = item;

        if (type === 'wound') {
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
        } else if (type === 'race' || type === 'cclass') {
            const itemList = parent.itemTypes[type];
            if (!itemList.length) return;

            Object.entries(itemList.slice(0, itemList.length -1))
                .map((a) => parent.items.get(a[1].id).delete());
        }
    }

    onClick() {
        return this.id;
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
