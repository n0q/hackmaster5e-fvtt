import { HMItem } from "./item.js";
import { HMCONST, SYSTEM_ID } from "../tables/constants.js";
import { sanitizeForBasicObjectBinding, isValidBasicObjectBinding } from "../data/data-utils.js";
import { SkillPrompt } from "../apps/skill-application.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";
import { SkillProcessor } from "../rules/processors/skill-processor.js";

export class HMSkillItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor) return;

        const actorData = this.actor.system;
        const { bonus, relevant, universal } = this.system;

        if (this.actor.type === "character") {
            const abilities = actorData.abilities.total;

            // It's not clear why this third term is needed, now.
            // Sometimes actgorData.abilities.total is null.
            // TODO: Fix this properly.
            if (universal && !bonus.mastery.value && abilities) {
                const stack = [];
                for (const key in relevant) {
                    if (relevant[key]) stack.push(abilities[key].value);
                }
                const value = Math.min(...stack);
                bonus.stats = { value, literacy: value, verbal: value };
            } else { delete bonus.stats; }
        }

        const actorBonus = actorData.bonus;
        const stateBonus = actorBonus?.state?.skills || 0;
        const honorBonus = actorBonus?.honor?.skills || 0;
        bonus.state = { value: stateBonus, literacy: stateBonus, verbal: stateBonus };
        bonus.honor = { value: honorBonus, literacy: honorBonus, verbal: honorBonus };

        Object.keys(bonus.total).forEach(key => {
            bonus.total[key] = Object.keys(bonus)
                .filter(v => v !== "total")
                .reduce((acc, value) => acc + bonus[value][key] || 0, 0);
        });
    }

    /**
     * Processes a skill check roll, creating prompts and chat messages.
     *
     * @param {Object} appData - Application data containing actor and mastery information
     * @param {Actor} appData.actor - The actor performing the skill check
     * @param {string} appData.mastery - The mastery type for the skill check
     * @returns {Promise<void>}
     */
    async process(appData) {
        const subject = { ...appData, skill: this };
        const result = await SkillPrompt.create({}, { subject });
        if (!result) return;

        const { rollMode, ...processorData } = result;
        processorData.uuid = { context: this.uuid };

        const bData = await SkillProcessor.process(processorData);
        bData.caller = appData.actor.uuid;
        const builder = await HMChatFactory.create(CHAT_TYPE.SKILL_CHECK, bData);
        builder.createChatMessage();
    }

    /**
     * Rolls a skill check for the first controlled actor found via bob.
     * Falls back to user's assigned character if no tokens are controlled and smart select is enabled.
     *
     * @param {BasicObjectBinding} bob - The bob to look up and roll.
     * @param {string} masteryType
     * @static
     */
    static rollByBob({ bob, masteryType = HMCONST.SKILL.TYPE.SKILL }) {
        if (!isValidBasicObjectBinding(bob, this.type)) {
            throw new Error(`Invalid Bob: '${bob}'.`);
        }

        const actors = canvas.tokens.controlled.map(token => token.actor);
        if (!actors.length && !game.user.isGM) {
            // No tokens were selected.
            const smartSelect = game.settings.get(SYSTEM_ID, "smartSelect");
            const { character } = game.user;
            if (smartSelect && character) actors.push(character);
        }

        if (actors.length < 1) return;

        const actor = actors[0];
        const skill = actor.getByBob(bob);
        if (!skill) return;

        const appData = { actor, masteryType };
        skill.process(appData);
    }

    /**
     * Generates a bob for a skill item.
     *
     * @override
     * @param {Object} skill - The skill item.
     * @returns {string} The generated bob.
     */
    _generateBasicObjectBinding() {
        const superBob = super._generateBasicObjectBinding();

        const { specialty } = this.system;
        const hasSpecialty = specialty.checked && specialty.value;

        if (!hasSpecialty) {
            return superBob;
        }

        const subname = sanitizeForBasicObjectBinding(specialty.value);
        const bob = `${superBob}_${subname}`;

        if (isValidBasicObjectBinding(bob, this.type)) {
            return bob;
        }

        throw new Error(`Invalid Bob: '${bob}'.`);
    }
}

