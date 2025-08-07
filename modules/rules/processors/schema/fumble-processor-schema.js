export class FumbleProcessorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        const numberOpts = { required: true, initial: 0, integer: true };
        const booleanOpts = { required: true, initial: false };

        return {
            atk: new fields.NumberField(numberOpts),
            def: new fields.NumberField(numberOpts),
            isRanged: new fields.BooleanField(booleanOpts),
            isInnate: new fields.BooleanField(booleanOpts),
        };
    }
}
