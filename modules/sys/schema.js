import { HMCurrencySchema } from '../item/schema/currency-item.schema.js';
import { HMRaceSchema } from '../item/schema/race-item-schema.js';
import { HMWoundSchema } from '../item/schema/wound-item-schema.js';

export const registerSchema = () => {
    CONFIG.Item.dataModels.currency = HMCurrencySchema;
    CONFIG.Item.dataModels.race = HMRaceSchema;
    CONFIG.Item.dataModels.wound = HMWoundSchema;
};
