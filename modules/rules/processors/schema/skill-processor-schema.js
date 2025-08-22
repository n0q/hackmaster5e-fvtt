import { HMCONST } from "../../../tables/constants.js";
import { MapField } from "../../../data/fields.js";

export class SkillProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        const numberOpts = { required: true, initial: 0, integer: true };
        const stringOpts = { required: false, initial: HMCONST.SKILL.TYPE.SKILL };

        return {
            resp: new fields.SchemaField({
                dc: new fields.NumberField(numberOpts),
                bonus: new fields.NumberField(numberOpts),
                masteryType: new fields.StringField(stringOpts),
            }),
            skillAggregatorMap: new MapField(),
        };
    }
}
