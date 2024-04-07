import { HMCurrencySchema } from '../item/schema/currency-item.schema.js';
import { HMRaceSchema } from '../item/schema/race-item-schema.js';
import { HMSkillSchema } from '../item/schema/skill-item-schema.js';
import { HMSpellSchema } from '../item/schema/spell-item-schema.js';
import { HMWoundSchema } from '../item/schema/wound-item-schema.js';

export const registerSchema = () => {
    CONFIG.Item.dataModels.currency = HMCurrencySchema;
    CONFIG.Item.dataModels.race = HMRaceSchema;
    CONFIG.Item.dataModels.skill = HMSkillSchema;
    CONFIG.Item.dataModels.spell = HMSpellSchema;
    CONFIG.Item.dataModels.wound = HMWoundSchema;
};
