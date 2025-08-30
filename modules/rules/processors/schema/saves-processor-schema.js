export class SavesProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const numberOpts = { required: true, initial: 0, integer: true, null: false };
        const stringOpts = { required: true };

        return {
            formulaType: new fields.StringField(stringOpts),
            resp: new fields.SchemaField({
                bonus: new fields.NumberField(numberOpts),
            }),
            context: new fields.ObjectField({ required: true }),
        };
    }
}
