import { HMCONST, HMTABLES } from '../../tables/constants.js';

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

    /* eslint-disable no-param-reassign */
    static migrateData(source) {
        if ('coins' in source) {
            const coins = foundry.utils.deepClone(HMTABLES.currency.coins);
            Object.keys(coins).forEach((coin) => { coins[coin].qty = 0; });
            source.coins = foundry.utils.mergeObject(coins, source.coins);
        }
    }
    /* eslint-enable no-param-reassign */
}
