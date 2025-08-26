import { HMCONST } from "../../tables/constants.js";
import { ThingSchema } from "./parts/thing-schema.js";

/**
 * Defines the schema for an HMArmorItem.
 * @property {HTMLField} description
 * @property {NumberField} armortype
 * @property {StringField} proficiency
 * @property {NumberField} damage - damage to the armor.
 * @property {SchemaField} bonus
 * @property {SchemaField} bonus.total
 * @property {SchemaField} bonus.base
 * @property {SchemaField} bonus.mod
 * @property {NumberField} qn - Quality number. Represents a +n armor.
 * @property {NumberField} ff - Fatigue factor.
 */
export class HMArmorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const typeOpts = { required: false, initial: HMCONST.ARMOR.TYPE.NONE, integer: true };
        return {
            ...ThingSchema.defineSchema(),
            description: new fields.HTMLField({ required: false, initial: undefined }),
            armortype: new fields.NumberField(typeOpts),
            proficiency: new fields.StringField({ required: false, initial: undefined }),
            damage: new fields.NumberField({ required: false, initial: 0, integer: true, null: false }),
            bonus: new fields.SchemaField({
                base: new fields.EmbeddedDataField(ArmorBonusSchema),
                mod: new fields.EmbeddedDataField(ArmorBonusSchema, { initial: { move: 0 } }),
            }),
            qn: new fields.NumberField({ required: false, initial: 0, integer: true }),
            ff: new fields.NumberField({ required: false, initial: 0, integer: true }),
        };
    }

    get isShield() {
        return this.armortype === HMCONST.ARMOR.TYPE.SHIELD;
    }

    /* eslint-disable no-param-reassign */
    static migrateData(source) {
        if (source?.damage == null) source.damage = 0;

        // 0.4.7 - Convert armortype from a string to a reference.
        if (typeof source.armortype === "string") {
            switch (source.armortype) {
                case "shield": {
                    source.armortype = HMCONST.ARMOR.TYPE.SHIELD;
                    break;
                }
                case "light": {
                    source.armortype = HMCONST.ARMOR.TYPE.LIGHT;
                    break;
                }
                case "medium": {
                    source.armortype = HMCONST.ARMOR.TYPE.MEDIUM;
                    break;
                }
                case "heavy": {
                    source.armortype = HMCONST.ARMOR.TYPE.HEAVY;
                    break;
                }
                default: {
                    source.armortype = HMCONST.ARMOR.TYPE.NONE;
                }
            }
        }
    }
    /* eslint-enable no-param-reassign */
}

/**
 * Schema for armor bonus fields (dr, def, init, spd, move).
 * Used by armor items for base and mod bonus vectors.
 */
class ArmorBonusSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const integerOpts = { required: false, initial: 0, integer: true, null: false };
        const floatOpts = { required: false, initial: 1.0, integer: false };

        return {
            dr: new fields.NumberField(integerOpts),
            def: new fields.NumberField(integerOpts),
            init: new fields.NumberField(integerOpts),
            spd: new fields.NumberField(integerOpts),
            move: new fields.NumberField(floatOpts),
        };
    }
}

