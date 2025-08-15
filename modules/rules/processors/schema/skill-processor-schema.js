export class SkillProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        const numberOpts = { required: true, initial: 0, integer: true };
        const uuidOpts = { blank: false, required: true, readonly: true };
        return {
            bonus: new fields.NumberField(numberOpts),
            dc: new fields.NumberField(numberOpts),
            formulaType: new fields.NumberField(numberOpts), // Temporary
            uuid: new fields.SchemaField({
                context: new fields.DocumentUUIDField(uuidOpts),
            }),
        };
    }
}
