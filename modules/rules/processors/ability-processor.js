import { ProcessorAbstract } from "./processor-abstract.js";
import { AbilityProcessorSchema } from "./schema/ability-processor.schema.js";

export class AbilityProcessor extends ProcessorAbstract {
    static SCHEMA_CLASS = AbilityProcessorSchema;

    async run() {
        const { ability, resp, context } = this.schema;
        const formula = `1d20p + @resp.mod @resp.oper @abilities.total.${ability}.value`;

        const rollContext = { resp, ...context };
        const roll = await new Roll(formula, rollContext).evaluate();

        const mdata = {
            ability,
            score: context?.abilities?.total?.[ability]?.value || 0
        };

        return {
            mdata,
            resp,
            roll: roll.toJSON(),
        };
    }
}
