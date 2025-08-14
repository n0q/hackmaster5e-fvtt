import { BasicObjectBindingField } from "./fields.js";

/**
 * Schema template for basic object bindings.
 *
 * @property {BasicObjectBindingField} value - bob
 * @property {BooleanField} auto - Should getters return an autobob?
 */
export class BasicObjectBindingSchema {
    static getFields() {
        const fields = foundry.data.fields;

        const stringOpts = {
            required: false,
            initial: null,
            nullable: true,
            trim: true,
            blank: true
        };

        const booleanOpts = {
            required: false,
            initial: true
        };

        return {
            value: new BasicObjectBindingField(stringOpts),
            auto: new fields.BooleanField(booleanOpts),
        };
    }
}
