import { HMCONST } from "../../../tables/constants.js";

export class SkillProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        const numberOpts = { required: true, initial: 0, integer: true };
        const uuidOpts = { blank: false, required: true, readonly: true };
        const stringOpts = { required: false, initial: HMCONST.SKILL.TYPE.SKILL };

        return {
            bonus: new fields.NumberField(numberOpts),
            dc: new fields.NumberField(numberOpts),
            mastery: new fields.StringField(stringOpts),
            uuid: new fields.SchemaField({
                context: new fields.DocumentUUIDField(uuidOpts),
            }),
        };
    }
}
