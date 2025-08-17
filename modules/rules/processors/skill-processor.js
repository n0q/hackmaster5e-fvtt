import { ProcessorAbstract } from "./processor-abstract.js";
import { SkillProcessorSchema } from "./schema/skill-processor-schema.js";
import { HMCONST } from "../../tables/constants.js";

const DIFFICULTY_MODIFIERS = {
    [HMCONST.SKILL.DIFF.VDIFFICULT]: 10,
    [HMCONST.SKILL.DIFF.DIFFICULT]: 0,
    [HMCONST.SKILL.DIFF.AVERAGE]: -40,
    [HMCONST.SKILL.DIFF.EASY]: -80,
    [HMCONST.SKILL.DIFF.TRIVIAL]: -90,
};

export class SkillProcessor extends ProcessorAbstract {
    static SCHEMA_CLASS = SkillProcessorSchema;

    async run() {
        const { uuid, ...resp } = this.schema;
        const formula = "d100";

        const roll = await new Roll(formula).evaluate();
        const skill = await fromUuid(uuid.context);

        const skillValue = skill.system.bonus.total[this.schema.masteryType];

        const mdata = {
            checkResult: roll.total - (this.schema.bonus + skillValue),
            opposedResult: roll.total + (this.schema.bonus + skillValue),
        };

        mdata.bestDc = this.getAchievedDifficulty(mdata.checkResult);

        return {
            resp,
            mdata,
            context: uuid.context,
            roll: roll.toJSON(),
        };
    }

    getAchievedDifficulty(checkResult) {
        const match = Object.entries(DIFFICULTY_MODIFIERS)
            .sort((a, b) => b[1] - a[1])
            .find(([_, mod]) => checkResult + mod <= 0);

        return match ? Number(match[0]) : null;
    }
}

/**
 * Calculate the percentage chance of success for a skill check.
 *
 * @param {Object} [params={}] - Parameters for the skill check.
 * @param {number} [params.dc=0] - Difficulty constant (enum key from HMCONST.SKILL.DIFF).
 * @param {number} [params.mastery=0] - Character's base skill level (0–100).
 * @param {number} [params.bonus=0] - Additional bonus applied to the skill (can be positive or negative).
 * @returns {number} Chance of success as a percentage (0–100).
 */
export const getChanceOfSuccess = ({ dc = 0, mastery = 0, bonus = 0 } = {}) => {
    const effectiveSkill = (Number(mastery) || 0) + (Number(bonus) || 0);
    const difficultyPenalty = DIFFICULTY_MODIFIERS[dc];
    const rawChance = effectiveSkill - difficultyPenalty;
    return Math.clamp(0, rawChance, 100);
};

