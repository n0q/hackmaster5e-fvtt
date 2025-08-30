import { HMArmorSchema } from "../item/schema/armor-item-schema.js";
import { HMCurrencySchema } from "../item/schema/currency-item.schema.js";
import { HMProficiencySchema } from "../item/schema/proficiency-item-schema.js";
import { HMRaceSchema } from "../item/schema/race-item-schema.js";
import { HMSkillSchema } from "../item/schema/skill-item-schema.js";
import { HMSpellSchema } from "../item/schema/spell-item-schema.js";
import { HMTalentSchema } from "../item/schema/talent-item-schema.js";
import { HMWoundSchema } from "../item/schema/wound-item-schema.js";

export const registerSchema = () => {
    CONFIG.Item.dataModels.armor = HMArmorSchema;
    CONFIG.Item.dataModels.currency = HMCurrencySchema;
    CONFIG.Item.dataModels.race = HMRaceSchema;
    CONFIG.Item.dataModels.proficiency = HMProficiencySchema;
    CONFIG.Item.dataModels.skill = HMSkillSchema;
    CONFIG.Item.dataModels.spell = HMSpellSchema;
    CONFIG.Item.dataModels.talent = HMTalentSchema;
    CONFIG.Item.dataModels.wound = HMWoundSchema;
};
