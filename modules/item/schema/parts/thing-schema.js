/**
 * @fileoverview Schema template for items which are physical things in the world.
 *               Includes equipped state, weight, price, and availability.
 */
import { HMCONST } from '../../../tables/constants.js';

export class ThingSchema {
    constructor() {
        const fields = foundry.data.fields;
        const stateOpts = {required: false, initial: HMCONST.ITEM_STATE.OWNED, integer: true};
        const floatOpts = {required: false, initial: 0, integer: false};
        const integerOpts = {required: false, initial: 0, integer: true};
        const stringOpts = {required: false, initial: undefined};

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
