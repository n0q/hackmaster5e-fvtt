import { HMCONST } from "../../../tables/constants.js";

/**
 * Schema template for items which are physical things in the world.
 *
 * @property {NumberField} state - Specifies if an item is equipped, carried, or owned.
 * @property {NumberField} weight (float) - Item weight in lbs.
 * @property {StringField} price - Price of the item.
 * @property {SchemaField} avail - Item availability.
 * @property {NumberField} avail.low - Low availability threshold.
 * @property {NumberField} avail.med - Medium availability threshold.
 * @property {NumberField} avail.high - High availability threshold.
 */
export class ThingSchema {
    static getFields() {
        const fields = foundry.data.fields;
        const stateOpts = { required: false, initial: HMCONST.ITEM_STATE.OWNED, integer: true };
        const floatOpts = { required: false, initial: 0, integer: false };
        const integerOpts = { required: false, initial: 0, integer: true };
        const stringOpts = { required: false, initial: undefined };

        return {
            state: new fields.NumberField(stateOpts),
            weight: new fields.NumberField(floatOpts),
            price: new fields.StringField(stringOpts),
            avail: new fields.SchemaField({
                high: new fields.NumberField(integerOpts),
                med: new fields.NumberField(integerOpts),
                low: new fields.NumberField(integerOpts),
            }),
        };
    }
}
