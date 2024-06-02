import { HMCONST } from '../../tables/constants.js';
import { ThingSchema } from './parts/thing-schema.js';

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
 * @property {BooleanField} shield.checked - True if armor is a shield.
 * @deprecated since 0.4.7. Use armortype instead.
 */
export class HMArmorSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const typeOpts = {required: false, initial: HMCONST.ARMOR.TYPE.NONE, integer: true};
        return {
            ...new ThingSchema(),
            description: new fields.HTMLField({required: false, initial: undefined}),
            armortype: new fields.NumberField(typeOpts),
            proficiency: new fields.StringField({required: false, initial: null}),
            damage: new fields.NumberField({required: false, initial: 0, integer: true}),
            bonus: new fields.SchemaField({
                total: getVectorSchema(),
                base: getVectorSchema(),
                mod: getVectorSchema({move: 0}),
            }),
            qn: new fields.NumberField({required: false, initial: 0, integer: true}),
            ff: new fields.NumberField({required: false, initial: 0, integer: true}),
            shield: new fields.SchemaField({
                checked: new fields.BooleanField({required: false, initial: false}),
            }),
        };
    }

    get isShield() {
        return this.armortype === HMCONST.ARMOR.TYPE.SHIELD;
    }

    /* eslint-disable no-param-reassign */
    static migrateData(source) {
        if (source?.damage == null) source.damage = 0;

        // 0.4.7 - Convert armortype from a string to a reference.
        if (typeof source.armortype === 'string') {
            switch (source.armortype) {
                case 'shield': {
                    source.armortype = HMCONST.ARMOR.TYPE.SHIELD;
                    break;
                }
                case 'light': {
                    source.armortype = HMCONST.ARMOR.TYPE.LIGHT;
                    break;
                }
                case 'medium': {
                    source.armortype = HMCONST.ARMOR.TYPE.MEDIUM;
                    break;
                }
                case 'heavy': {
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
 * Defines a vector schema suitable for Armor bonus.
 * @property {dr} NumberField - Damage Reduction modifier (integer).
 * @property {def} NumberField - Defensive modifier (integer).
 * @property {init} NumberField - Initiative modifier (integer).
 * @property {spd} NumberField - Weapon speed modifier (integer).
 * @property {move} NumberField - Movement modifier (float).
 */
function getVectorSchema({move = 1.0} = {}) {
    const fields = foundry.data.fields;
    const integerOpts = {required: false, initial: 0, integer: true};
    const floatOpts = {required: false, initial: move, integer: false};

    return new fields.SchemaField({
        dr: new fields.NumberField(integerOpts),
        def: new fields.NumberField(integerOpts),
        init: new fields.NumberField(integerOpts),
        spd: new fields.NumberField(integerOpts),
        move: new fields.NumberField(floatOpts),
    });
}
