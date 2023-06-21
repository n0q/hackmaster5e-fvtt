import { HMItem } from './item.js';
import { HMArmorItem } from './armor-item.js';
import { HMClassItem } from './class-item.js';
import { HMCurrencyItem } from './currency-item.js';
import { HMItemItem } from './item-item.js';
import { HMProficiencyItem } from './proficiency-item.js';
import { HMRaceItem } from './race-item.js';
import { HMSkillItem } from './skill-item.js';
import { HMSpellItem } from './spell-item.js';
import { HMTalentItem } from './talent-item.js';
import { HMWeaponItem } from './weapon-item.js';
import { HMWoundItem } from './wound-item.js';
import { SYSTEM_ID } from '../tables/constants.js';

const handler = {
    construct(_actor, args) {
        if (args[0]?.type === 'armor') return new HMArmorItem(...args);
        if (args[0]?.type === 'cclass') return new HMClassItem(...args);
        if (args[0]?.type === 'currency') return new HMCurrencyItem(...args);
        if (args[0]?.type === 'item') return new HMItemItem(...args);
        if (args[0]?.type === 'proficiency') return new HMProficiencyItem(...args);
        if (args[0]?.type === 'race') return new HMRaceItem(...args);
        if (args[0]?.type === 'skill') return new HMSkillItem(...args);
        if (args[0]?.type === 'spell') return new HMSpellItem(...args);
        if (args[0]?.type === 'talent') return new HMTalentItem(...args);
        if (args[0]?.type === 'weapon') return new HMWeaponItem(...args);
        if (args[0]?.type === 'wound') return new HMWoundItem(...args);
        throw new Error(SYSTEM_ID, {type: args[0]?.type});
    },
};

export const HMItemFactory = new Proxy(HMItem, handler);
