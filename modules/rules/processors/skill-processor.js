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

        const skillValue = skill.system.bonus.total[this.schema.mastery];

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
