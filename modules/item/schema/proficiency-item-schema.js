import { BasicObjectBindingSchema } from "../../data/bob-schema.js";

export class HMProficiencySchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const integerOpts = { required: false, initial: 0, min: 0, integer: true, null: false };
        const booleanOpts = { required: false, initial: false };
        const stringOpts = { required: false, initial: undefined };

        return {
            description: new fields.HTMLField(stringOpts),
            bonus: new fields.SchemaField({
                atk: new fields.NumberField(integerOpts),
                def: new fields.NumberField(integerOpts),
                dmg: new fields.NumberField(integerOpts),
                spd: new fields.NumberField(integerOpts),
            }),
            skill: new fields.StringField(stringOpts),
            weapon: new fields.SchemaField({
                checked: new fields.BooleanField(booleanOpts),
            }),
            ranged: new fields.SchemaField({
                checked: new fields.BooleanField(booleanOpts),
            }),
            mechanical: new fields.SchemaField({
                checked: new fields.BooleanField(booleanOpts),
            }),
            bob: new fields.EmbeddedDataField(BasicObjectBindingSchema),
        };
    }

    /**
     * system.bonus contains values, not objects. Unsuitable for intake.
     */
    get agg() {
        return { base: this.bonus };
    }

    static migrateData(source) {
        const migrated = super.migrateData(source);

        // These values should never be negative.
        if (migrated.bonus) {
            migrated.bonus = Object.keys(migrated.bonus).reduce((acc, k) => {
                acc[k] = Math.abs(migrated.bonus[k]) || 0;
                return acc;
            }, {});
        }
        return migrated;
    }
}

