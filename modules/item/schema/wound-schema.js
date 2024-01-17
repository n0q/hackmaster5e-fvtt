export class HMWoundSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            hp: new fields.NumberField({required: true, initial: 0, integer: true}),
            timer: new fields.NumberField({required: true, initial: 0, integer: true}),
        };
    }
}
