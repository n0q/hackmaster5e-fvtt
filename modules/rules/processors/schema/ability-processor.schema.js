export class AbilityProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const numberOpts = { required: true, initial: 0, integer: true, null: false };
        const stringOpts = { required: true };
        const booleanOpts = { required: true };

        return {
            ability: new fields.StringField(stringOpts),
            resp: new fields.SchemaField({
                mod: new fields.NumberField(numberOpts),
                oper: new fields.StringField(stringOpts),
                save: new fields.BooleanField(booleanOpts),
            }),
            context: new fields.ObjectField({ required: true }),
        };
    }
}

