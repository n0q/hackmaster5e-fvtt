import { ProcessorAbstract } from "./processor-abstract.js";
import { SavesProcessorSchema } from "./schema/saves-processor-schema.js";
import { HMCONST } from "../../tables/constants.js";
import { getDiceSum } from "../../sys/utils.js";

const buildSaveFormula = formulaType => {
    if (formulaType === "trauma") {
        return "@talent.die.trauma - (@bonus.total.trauma + @resp.bonus)";
    }
    return `d20p + @bonus.total.${formulaType} + @resp.bonus`;
};

const traumaFormulas = {
    comaCheck: "d20",
    comaDuration: "d20",
    koDuration: "5d6p"
};

export class SavesProcessor extends ProcessorAbstract {
    static SCHEMA_CLASS = SavesProcessorSchema;

    async run() {
        const { formulaType, resp, context } = this.schema;
        const formula = buildSaveFormula(formulaType);

        const rollContext = {
            ...context,
            resp,
            talent: context.talent,
        };

        const roll = await new Roll(formula, rollContext).evaluate();
        const mdata = { formulaType };

        if (formulaType === "trauma") {
            return await this.#processTraumaCheck(roll, mdata, resp);
        }

        return {
            mdata,
            resp,
            roll: roll.toJSON(),
        };
    }

    async #processTraumaCheck(roll, mdata, resp) {
        const failType = HMCONST.TRAUMA_FAILSTATE;
        let failState = failType.PASSED;
        const batch = [roll];

        if (roll.total <= 0) {
            return {
                batch: [roll.toJSON()],
                mdata: { ...mdata, failState },
                resp,
            };
        }

        // Extended Trauma rules
        failState = failType.FAILED;
        if (getDiceSum(roll) > 19) {
            failState = failType.KO;

            const { comaCheck, comaDuration, koDuration } = traumaFormulas;
            const comaCheckRoll = await new Roll(comaCheck).evaluate();
            batch.push(comaCheckRoll);

            if (comaCheckRoll.total > 19) failState = failType.COMA;

            const durationFormula = failState === failType.COMA ? comaDuration : koDuration;
            const durationRoll = await new Roll(durationFormula).evaluate();

            if (failState === failType.COMA && durationRoll.total > 19) {
                failState = failType.VEGETABLE;
            }

            batch.push(durationRoll);
        }

        return {
            batch: batch.map(r => r.toJSON()),
            mdata: { ...mdata, failState },
            resp,
        };
    }
}

