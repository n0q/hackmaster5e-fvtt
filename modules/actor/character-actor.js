import { HMActor } from './actor.js';
import { HMCONST, HMTABLES } from '../sys/constants.js';

export class HMCharacterActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
        this.setRace();
        this.setCClass();
        this.setAbilities();
        this.setAbilityBonuses();
        this.setBonusTotal();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setBonusTotal();
        this.setExtras();
        this.setEncumbrance();
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

    setAbilities() {
        const {abilities} = this.system;

        const total = {};
        for (const stat in abilities.base) {
            let value = 0;
            let fvalue = 0;
            for (const row in abilities) {
                if (row === 'total') { continue; }
                value  += abilities[row][stat].value;
                fvalue += abilities[row][stat].fvalue;
            }
            value += Math.floor(fvalue / 100);
            fvalue = ((fvalue % 100) + 100) % 100;
            total[stat] = {value, fvalue};
        }
        abilities.total = total;
    }

    setAbilityBonuses() {
        const {system} = this;
        const aData = system.abilities.total;

        const stats        = {};
        const abilityBonus = {};

        for (const statName in aData) {
            const clamp = HMTABLES.abilitymods.clamp[statName];
            const statDerived = aData[statName].value + aData[statName].fvalue / 100;
            const statAdj = Math.clamped(statDerived, clamp.min, clamp.max);

            const sidx = Math.floor((statAdj - clamp.min) / clamp.step);
            const bonusTable = HMTABLES.abilitymods[statName][sidx];
            abilityBonus[statName] = bonusTable;
            for (const key in bonusTable) {
                if (bonusTable.hasOwnProperty(key)) {
                    stats[key] = (stats?.[key] || 0) + bonusTable[key];
                    if (key === 'chamod') { aData.cha.value += stats[key] || 0; }
                }
            }
        }

        stats.hp     = aData.con.value;
        stats.poison = aData.con.value;
        stats.trauma = Math.floor(aData.con.value / 2);

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
}
