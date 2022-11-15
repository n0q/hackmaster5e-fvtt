import { HMTABLES, MODULE_ID } from '../sys/constants.js';
import { HMActor } from './actor.js';

export class HMCharacterActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
        this.setRace();
        this.setCClass();
        this.setAbilities();
        this.setAbilityBonuses();
        this.setEncumbrance();
        this.setBonusTotal();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setBonusTotal();
        this.setExtras();
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

    setAbilities() {
        const {abilities} = this.system;
        const total = {};

        Object.keys(abilities.base).forEach((stat) => {
            let value = 0;
            let fvalue = 0;

            Object.keys(abilities).forEach((vector) => {
                if (vector === 'total') { return; }
                value  += abilities[vector][stat].value;
                fvalue += abilities[vector][stat].fvalue;
            });

            value += Math.floor(fvalue / 100);
            fvalue = ((fvalue % 100) + 100) % 100;

            const clamp = HMTABLES.abilitymods.clamp[stat];
            const statSum = value + fvalue / 100;
            const statAdj = Math.clamped(statSum, clamp.min, clamp.max);
            const idx = Math.floor((statAdj - clamp.min) / clamp.step);

            total[stat] = {value, fvalue, idx};
        });
        abilities.total = total;
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
                    if (key === 'chamod') { total.cha.value += stats[key] || 0; }
                }
            });
        });

        stats.hp     = total.con.value;
        stats.poison = total.con.value;
        stats.trauma = Math.floor(total.con.value / 2);

        system.bonus.stats = stats;
        system.hmsheet ? system.hmsheet.bonus = abilityBonus
                       : system.hmsheet = {'bonus': abilityBonus};
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
            const {system, type} = item[i];
            const load = system.weight * (Math.max(system?.qty, 1) || 1);
            switch (invstate) {
                case 'innate': break;

                case 'equipped': {
                    if (type === 'armor' && !system?.shield?.checked) armor += load;
                }
                // Falls through

                case 'carried': {
                    carried += load;
                    break;
                }
                default:
            }
        }

        const effective = carried - armor;
        const {priors} = this.system;
        const total = carried + HMTABLES.weight(priors.bmi, priors.height) || 0.0;
        this.system.encumb = {carried, effective, total};

        const penalty = this.getFlag(MODULE_ID, 'encumbrance') || 0;
        this.system.bonus.encumb = HMTABLES.encumbrance[penalty];
    }

    async setCClass() {
        const {system} = this;
        const cclasses = this.itemTypes.cclass;
        if (!cclasses.length) return;

        const cclass = cclasses[cclasses.length -1];
        cclass._prepCClassData();
        const objData = cclass.system;
        if (objData.level > 0) system.bonus.class = objData.bonus;

        Object.entries(cclasses.slice(0, cclasses.length -1))
            .map((a) => this.items.get(a[1].id).delete());
    }

    setExtras() {
        const {system} = this;
        system.sp.max = system.bonus.total?.sp || 0;
        system.luck.max = system.bonus.total?.luck || 0;
        const cclass = this.items.find((a) => a.type === 'cclass');
        if (!cclass) return;

        const {level} = cclass.system;

        const hValue = parseInt(system.honor.value, 10) || 0;
        system.honor.bracket = HMTABLES.bracket.honor(level, hValue) || 0;
        system.honor.value = Math.min(hValue, 999);

        const fValue = parseInt(system.fame.value, 10) || 0;
        system.fame.bracket = HMTABLES.bracket.fame(fValue) || 0;
        system.fame.value = Math.min(fValue, 999);
    }

    setRace() {
        const {system} = this;
        const races = this.itemTypes.race;
        if (!races.length) return;

        const race = races[races.length -1];
        race.prepareBaseData();
        system.bonus.race     = race.system.bonus;
        system.abilities.race = race.system.abilities;

        Object.entries(races.slice(0, races.length -1))
            .map((a) => this.items.get(a[1].id).delete());
    }

    getAbilityBonus(ability, bonus) {
        const {idx} = this.system.abilities.total[ability];
        return HMTABLES.abilitymods[ability][idx][bonus];
    }
}
