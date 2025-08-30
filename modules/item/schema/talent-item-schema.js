import { HMCONST } from "../../tables/constants.js";
import { BasicObjectBindingSchema } from "../../data/bob-schema.js";

export class HMTalentSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const integerOpts = { required: false, initial: 0, integer: true, null: false };
        const booleanOpts = { required: false, initial: false };
        const stringOpts = { required: false, initial: undefined };
        const activeEffectElement = new fields.SchemaField({
            key: new fields.StringField({ required: true, blank: false }),
            mode: new fields.NumberField({ required: true, integer: true, min: 0 }),
            priority: new fields.NumberField({ required: true, integer: true, min: 0 }),
            value: new fields.StringField({ required: true })
        });
        const validTypes = Object.values(HMCONST.TALENT);

        return {
            description: new fields.HTMLField(stringOpts),
            bonus: new fields.SchemaField({
                atk: new fields.NumberField(integerOpts),
                def: new fields.NumberField(integerOpts),
                dmg: new fields.NumberField(integerOpts),
                spd: new fields.NumberField(integerOpts),
                reach: new fields.NumberField(integerOpts),
            }),
            changes: new fields.ArrayField(activeEffectElement),
            type: new fields.NumberField({ ...integerOpts, choices: validTypes }),
            weapon: new fields.SchemaField({
                ranged: new fields.BooleanField(booleanOpts),
                mechanical: new fields.BooleanField(booleanOpts),
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

    get isRanged() {
        return this.weapon.ranged;
    }

    get isMechanical() {
        return this.isRanged ? this.weapon.mechanical : false;
    }
}

