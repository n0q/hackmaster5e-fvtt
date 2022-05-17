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
        const raceMove = this.data.data.bonus.race?.move || 0;
        let movespd = Object.values(HMTABLES.movespd).map((x) => x * raceMove);

        const armorMove = this.data.data.bonus.armor?.move || 1;
        if (armorMove !== 1) {
            const armorPenalty = [1, 1, armorMove, armorMove, armorMove];
            movespd = movespd.map((move, i) => move * armorPenalty[i]);
        }
        return movespd;
    }

    setAbilities() {
        const { abilities } = this.data.data;

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
        const {data} = this.data;
        const aData  = data.abilities.total;

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

        data.bonus.stats = stats;
        data.hmsheet ? data.hmsheet.bonus = abilityBonus
                     : data.hmsheet = {'bonus': abilityBonus};
    }

    setEncumbrance() {
        const item = this.items.filter((a) => {
            const {data} = a.data;
            if (!('state' in data)) return false;
            return true;
        });

        let carried = 0.0;
        let armor = 0.0;
        for (let i=0; i < item.length; i++) {
            const {invstate} = item[i];
            const {data, type} = item[i].data;
            const load = data.weight * (Math.max(data?.qty, 1) || 1);
            switch (invstate) {
                case 'innate': break;

                case 'equipped': {
                    if (type === 'armor' && !data?.shield?.checked) {
                        armor += load;
                    }
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
        const {priors} = this.data.data;
        const total = carried + HMTABLES.weight(priors.bmi, priors.height) || 0.0;
        this.data.data.encumb = {carried, effective, total};
    }

    async setCClass() {
        const {data} = this.data;
        const cclasses = this.items.filter((a) => a.type === 'cclass');
        if (!cclasses.length) return;
        const cclass = cclasses.pop();

        cclass._prepCClassData();
        const objData = cclass.data.data;
        if (objData.level > 0) { data.bonus.class = objData.bonus; }

        if (cclasses.length) {
            let oldclass;
            while (oldclass = cclasses.pop()) await oldclass.delete();
        }
    }

    setExtras() {
        const {data} = this.data;
        data.sp.max = data.bonus.total?.sp || 0;
        const cclass = this.items.find((a) => a.type === 'cclass');
        if (!cclass) return;

        const {level} = cclass.data.data;

        const hValue = parseInt(data.honor.value, 10) || 0;
        data.honor.bracket = HMTABLES.bracket.honor(level, hValue) || 0;
        data.honor.value = Math.min(hValue, 999);

        const fValue = parseInt(data.fame.value, 10) || 0;
        data.fame.bracket = HMTABLES.bracket.fame(fValue) || 0;
        data.fame.value = Math.min(fValue, 999);
    }
}
