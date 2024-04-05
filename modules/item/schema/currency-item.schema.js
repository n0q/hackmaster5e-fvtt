import { HMCONST } from '../../tables/constants.js';

export class HMCurrencySchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const {OWNED} = HMCONST.ITEM_STATE;
        const fields = foundry.data.fields;
        return {
            state: new fields.NumberField({required: false, initial: OWNED, integer: true}),
            weight: new fields.NumberField({required: false, initial: 0, integer: false}),
            issuer: new fields.StringField({required: false, initial: undefined}),
            coins: new fields.ObjectField({required: false, initial: {}}),
        };
    }
}
