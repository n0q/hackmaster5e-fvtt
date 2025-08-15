import { HMItem } from "./item.js";
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

        if (isValidBasicObjectBinding(bob)) {
            return bob;
        }

        throw new Error(`Invalid Bob: '${bob}'.`);
    }
}

