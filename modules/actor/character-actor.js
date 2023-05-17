import { HMCONST, HMTABLES, SYSTEM_ID } from '../tables/constants.js';
import { HMActor } from './actor.js';

export class HMCharacterActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
        this.setRace();
        this.setCClass();
        this.setAbilities();
        this.setAbilityBonuses();
        this.setEncumbrance();
        this.setHonor();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setBonusTotal();
        this.setHP();
        this.setExtras();
        this.prepareWeaponProfiles();
    }

    get movespd() {
        const raceMove = this.system.bonus.race?.move || 0;
        let movespd = Object.values(HMTABLES.movespd).map((x) => x * raceMove);

        const armorMove = this.system.bonus.armor?.move || 1;
        if (armorMove !== 1) {
            const armorPenalty = [1, 1, armorMove, armorMove, armorMove];
            movespd = movespd.map((move, i) => move * armorPenalty[i]);
        }
        return movespd;
    }

    get encumbrance() {
        const {idx} = this.system.abilities.total.str;
        return HMTABLES.abilitymods.encumbrance[idx];
    }

    resetBonus() {
        super.resetBonus();
        const {ITEM_STATE} = HMCONST;
        const hasArmor = this.itemTypes.armor.find((a) => a.system.state === ITEM_STATE.EQUIPPED
                                                      && !a.system.shield.checked);

        if (!hasArmor) this.system.bonus.armor = {init: -1};
    }

    setAbilities({adjust, delta}={}) {
        const {abilities} = this.system;
        if (!abilities.total) abilities.total = {};

        // Looks adjusts Charisma, so we will need to do a second pass.
        const abilitiesIter = adjust ? [adjust] : Object.keys(abilities.base);
        abilitiesIter.forEach((stat) => {
            let {value, fvalue} = abilities.base[stat];
            fvalue = (fvalue + 99) % 100;

            Object.keys(abilities).forEach((vector) => {
                if (vector === 'total' || vector === 'base') return;
                value  += abilities[vector][stat].value;
                fvalue += abilities[vector][stat].fvalue;
            });

            value += Math.floor(fvalue / 100) + (delta || 0);
            fvalue = ((fvalue % 100) + 100) % 100;

            const clamp = HMTABLES.abilitymods.clamp[stat];
            const statSum = value + (fvalue / 100);
            const statAdj = Math.clamped(statSum, clamp.min, clamp.max);
            const idx = Math.floor((statAdj - clamp.min) / clamp.step);

            fvalue = (fvalue + 101) % 100;
            if (value < 1) [value, fvalue] = [1, 1];
            abilities.total[stat] = {value, fvalue, idx};
        });
    }

    setAbilityBonuses() {
        const {system} = this;
        const {total} = system.abilities;

        const stats        = {};
        const abilityBonus = {};

        Object.keys(total).forEach((statName) => {
            const {idx} = total[statName];
            const bonusTable = HMTABLES.abilitymods[statName][idx];
            abilityBonus[statName] = bonusTable;

            Object.keys(bonusTable).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(bonusTable, key)) {
                    stats[key] = (stats?.[key] || 0) + bonusTable[key];
                    if (key === 'chamod') this.setAbilities({adjust: 'cha', delta: stats[key]});
                }
            });
        });

        stats.hp     = total.con.value;
        stats.poison = total.con.value;
        stats.trauma = Math.floor(total.con.value / 2);

        system.bonus.stats = stats;
        system.hmsheet ? system.hmsheet.bonus = abilityBonus
                       : system.hmsheet = {bonus: abilityBonus};
    }

    setEncumbrance() {
        const item = this.items.filter((a) => {
            const data = a.system;
            if (!('state' in data)) return false;
            return true;
        });

        let carried = 0.0;
        let armor = 0.0;
        for (let i=0; i < item.length; i++) {
            const {invstate} = item[i];
            const {system, type, weight} = item[i];
            switch (invstate) {
                case 'innate': break;

                case 'equipped': {
                    if (type === 'armor' && !system?.shield?.checked) armor += weight.total;
                }
                // Falls through

                case 'carried': {
                    carried += weight.total;
                    break;
                }
                default:
            }
        }

        const effective = carried - armor;
        const {priors} = this.system;
        const total = carried + HMTABLES.weight(priors.bmi, priors.height) || 0.0;
        this.system.encumb = {carried, effective, total};

        let penalty = this.getFlag(SYSTEM_ID, 'encumbrance') || 0;
        if (game.settings.get(SYSTEM_ID, 'autoEncumbrance')) {
            const {idx} = this.system.abilities.total.str;
            const encumbrance = [...HMTABLES.abilitymods.encumbrance[idx], Infinity];
            penalty = encumbrance.findIndex((x) => effective <= x);
            this.encIdx = penalty;
            this.setFlag(SYSTEM_ID, 'encumbrance', penalty);
        }
        this.encumbranceIdx = penalty;
        this.system.bonus.encumb = HMTABLES.encumbrance[penalty];
    }

    setHonor() {
        const cclass = this.items.find((a) => a.type === 'cclass');
        if (!cclass) return;

        const {system} = this;
        const {level} = cclass.system;
        const hValue = parseInt(system.honor.value, 10) || 0;

        const bracket = HMTABLES.bracket.honor(level, hValue) || 0;
        const value = Math.min(hValue, 999);
        system.honor = {bracket, value};

        if (bracket < HMCONST.HONOR.LOW) {
            system.bonus.honor = HMTABLES.bracket.dishonor();
        }
    }

    setExtras() {
        const {system} = this;
        system.sp.max = system.bonus.total?.sp || 0;
        system.luck.max = system.bonus.total?.luck || 0;

        const fValue = parseInt(system.fame.value, 10) || 0;
        system.fame.bracket = HMTABLES.bracket.fame(fValue) || 0;
        system.fame.value = Math.min(fValue, 999);

        const {priors} = system;
        priors.weight = HMTABLES.weight(priors.bmi || 0, priors.height || 0);
    }

    setCClass() {
        const {system} = this;
        const cclasses = this.itemTypes.cclass;
        if (!cclasses.length) return;

        const cclass = cclasses[0];
        cclass.prepareBaseData();

        const objData = cclass.system;
        if (objData.level) system.bonus.class = objData.bonus;
        const {level} = cclass.system;
        system.ep.max = HMTABLES.cclass.epMax[level];
    }

    setRace() {
        const {system} = this;
        const races = this.itemTypes.race;
        if (!races.length) return;

        const race = races[0];
        race.prepareBaseData();

        system.bonus.race     = race.system.bonus;
        system.abilities.race = race.system.abilities;
    }

    getAbilityBonus(ability, bonus) {
        const {idx} = this.system.abilities.total[ability];
        return HMTABLES.abilitymods[ability][idx][bonus];
    }
}
