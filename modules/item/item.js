import { HM_ICON, HMCONST, HMTABLES, SYSTEM_ID } from "../tables/constants.js";
import { HMDialogFactory } from "../dialog/dialog-factory.js";
import { HMStates } from "../sys/effects.js";
import { HMSkillSchema } from "./schema/skill-item-schema.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";

// Remember: Items may not alter Actors under any circumstances.
// You will create a free fire shooting gallery if you do this, and
// we are making Hackmaster, not Aces & Eights.

export class HMItem extends Item {
    static getDefaultArtwork(data = {}) {
        const { img, texture } = super.getDefaultArtwork(data);
        return {
            img: HM_ICON[data.type] ?? HM_ICON.default ?? img,
            texture: { src: texture },
        };
    }

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
        const { _id, container } = this;
        if (container) {
            let { _manifest } = container.system.container;
            _manifest = _manifest.filter(a => JSON.parse(a)._id !== _id);
            container.update({ "system.container._manifest": _manifest });
        } else super.delete(...args);
    }

    /** @override */
    async update(...args) {
        const { _id, container } = this;
        if (container) {
            const [data] = args;
            const cIdx = container._manifestData.findIndex(a => a._id === _id);
            this.updateSource(data);
            const { _manifest } = container.system.container;
            _manifest[cIdx] = JSON.stringify(this);
            container.apps[this.appId] = this;
            container.update({ "system.container._manifest": _manifest });
        } else super.update(...args);
    }

    get quality() {
        const { system } = this;
        const qKey = system?.ranged?.checked ? "ranged" : this.type;
        const { bonus, qn } = system;
        const values = HMTABLES.quality[qKey].map(a => a * qn);
        const keys = Object.keys(bonus.total);
        return Object.fromEntries(keys.map((_, i) => [keys[i], values[i] ?? 0]));
    }

    get specname() {
        const rawName = this.name;
        if (this.type !== "skill") return rawName;
        const { specialty } = this.system;
        if (specialty.checked && specialty.value.length) return `${rawName} (${specialty.value})`;
        return rawName;
    }

    get weight() {
        const { weight, qty } = this.system;
        const { items } = this;

        const intrinsic = (Math.max(weight, 0) || 0) * (Math.max(qty, 1) || 1);
        const contents = items ? items.reduce((acc, item) => acc + item.weight.total, 0) || 0 : 0;
        const total = intrinsic + contents;

        return { intrinsic, contents, total };
    }

    // HACK: Temporary measure until future inventory overhaul.
    get invstate() {
        const state = parseInt(this.system.state, 10) || 0;
        return HMTABLES.itemstate[state];
    }

    /**
     * @param {string} skillName
     * @param {string|null} specialty
     * @param {HMActor} caller
     * @param {string} itemId
     * @todo Move this horrible function somewhere else.
     */
    static async rollSkill({ skillName, specialty = null, caller, itemId }) {
        const callers = [];

        if (caller) {
            // Named caller.
            callers.push({ caller, context: caller.items.get(itemId) });
        } else {
            // Anonymous caller. Get all selected tokens.
            const actors = canvas.tokens.controlled.map(token => token.actor);

            if (!actors.length && !game.user.isGM) {
                // No tokens were selected.
                const smartSelect = game.settings.get(SYSTEM_ID, "smartSelect");
                const { character } = game.user;
                if (smartSelect && character) actors.push(character);
            }

            if (!actors.length) return;

            actors.forEach(actor => {
                const skills = actor.itemTypes.skill.filter(a => a.name === skillName);
                let context = specialty
                    ? skills.find(a => a.system.specialty.value === specialty)
                    : skills[0];

                // Unskilled actor.
                if (!context) {
                    const system = new HMSkillSchema();
                    let specname = skillName;
                    if (specialty) {
                        system.specialty = { checked: true, value: specialty };
                        specname += ` (${specialty})`;
                    }
                    context = { name: skillName, specname, system };
                }

                callers.push({ caller: actor, context });
            });
        }

        // NOTE: We don't know if it's a language if none of the callers have the skill.
        const dialogCaller = callers.find(a => a.context._id) ?? callers[0];
        const dialogDataset = {
            dialog: "skill",
            context: dialogCaller.context,
            callers: callers.length,
        };

        const dialogResp = await HMDialogFactory(dialogDataset, dialogCaller.caller);
        const { resp } = dialogResp;

        Object.values(callers).forEach(async callerObj => {
            const formula = HMTABLES.formula.skill.baseroll;
            const roll = await new Roll(formula).evaluate();

            const bData = {
                caller: callerObj.caller.uuid,
                context: callerObj.context.uuid,
                mdata: callerObj.context.system,
                resp,
                roll: roll.toJSON(),
            };

            const builder = await HMChatFactory.create(CHAT_TYPE.SKILL_CHECK, bData);
            return builder.createChatMessage();
        });
    }

    onClick() {
        return this.id;
    }
}

export async function advanceClock(comData, dialogResp, smartInit = false) {
    const { active } = game.combats;
    const { resp } = dialogResp;
    const { combatant, round, initiative } = comData;
    const isReset = resp.specialMove === HMCONST.SPECIAL.RESET;
    const delta = isReset
        ? Number(resp.advance + round - initiative) || 0
        : Number(resp.advance) || 0;
    const oldInit = smartInit
        ? Math.max(initiative, round)
        : round;
    const newInit = oldInit + delta;
    active.setInitiative(combatant.id, newInit);

    const batch = [{
        name: combatant.name,
        hidden: combatant.hidden,
        delta,
        oldInit,
        newInit,
    }];

    const caller = combatant.token.uuid;
    const builder = await HMChatFactory.create(CHAT_TYPE.INIT_NOTE, { caller, batch });
    builder.createChatMessage();
}

// TODO: Convert to using world timer.
export async function setStatusEffectOnToken(comData, effect, rounds = null) {
    const { active } = game.combats;
    const { combatant } = comData;
    const combatToken = canvas.scene.tokens.get(combatant.tokenId);
    const duration = rounds ? {
        combat: active.id,
        startRound: active.round,
        rounds,
        type: "rounds",
    } : null;
    await HMStates.setStatusEffect(combatToken, effect, duration);
}

export async function unsetStatusEffectOnToken(comData, effect) {
    const { combatant } = comData;
    const combatToken = canvas.scene.tokens.get(combatant.tokenId);
    await HMStates.unsetStatusEffect(combatToken, effect);
}
