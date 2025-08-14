import { BasicObjectBindingField } from "./fields.js";
/**
 * Basic Object Binding (BOB) Format Specification
 *
 * Format: `type:identifier`
 * Where identifier is: `name` or `name_subname`
 *
 * Complete format: `type:name_subname`
 *
 * Rules:
 * - All components use lowercase letters (a-z), numbers (0-9), and hyphens (-)
 * - Type and identifier are separated by a colon (:)
 * - Optional subname is separated by underscore (_)
 * - Examples:
 *   - "skill:arcane-lore"
 *   - "skill:musicianship_rebec"
 *   - "weapon:longsword"
 *
 * @typedef {string} BasicObjectBinding
 */

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
