import { DEFAULT_ICON, HMTABLES, HMCONST, SYSTEM_ID } from '../tables/constants.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMStates } from '../sys/effects.js';

// Remember: Items may not alter Actors under any circumstances.
// You will create a free fire shooting gallery if you do this, and
// we are making Hackmaster, not Aces & Eights.

export class HMItem extends Item {
    static DEFAULT_ICON = DEFAULT_ICON;

    /** @override */
    prepareData() {
        this.prepareBaseData();
        super.prepareEmbeddedDocuments();
        this.prepareDerivedData();
    }

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
    }

    /** @override */
    async delete(...args) {
        const {_id, container} = this;
        if (container) {
            let {_manifest} = container.system.container;
            _manifest = _manifest.filter((a) => JSON.parse(a)._id !== _id);
            container.update({'system.container._manifest': _manifest});
        } else super.delete(...args);
    }

    /** @override */
    async update(...args) {
        const {_id, container} = this;
        if (container) {
            const [data] = args;
            const cIdx = container._manifestData.findIndex((a) => a._id === _id);
            this.updateSource(data);
            const {_manifest} = container.system.container;
            _manifest[cIdx] = JSON.stringify(this);
            container.apps[this.appId] = this;
            container.update({'system.container._manifest': _manifest});
        } else super.update(...args);
    }

    get quality() {
        const {system} = this;
        const qKey = system?.ranged?.checked ? 'ranged' : this.type;
        const {bonus, qn} = system;
        const values = HMTABLES.quality[qKey].map((a) => a * qn);
        const keys = Object.keys(bonus.total);
        return Object.fromEntries(keys.map((_, i) => [keys[i], values[i] ?? 0]));
    }

    get specname() {
        const rawName = this.name;
        if (this.type !== 'skill') return rawName;
        const {specialty} = this.system;
        if (specialty.checked && specialty.value.length) return `${rawName} (${specialty.value})`;
        return rawName;
    }

    get weight() {
        const {weight, qty} = this.system;
        const {items} = this;

        const intrinsic = (weight || 0) * (qty || 1);
        const contents = items ? items.reduce((acc, item) => acc + item.weight.total, 0) || 0 : 0;
        const total = intrinsic + contents;

        return {intrinsic, contents, total};
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

            const smartSelect = game.settings.get(SYSTEM_ID, 'smartSelect');
            if (!actors.length && smartSelect) {
                const {character} = game.user;
                if (character) actors.push(character);
            }

            Object.values(actors).forEach((actor) => {
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

        const dialogResp = await HMDialogFactory(dialogDataset, dialogCaller.caller);
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
