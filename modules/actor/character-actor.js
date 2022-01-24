import { HMActor } from './actor.js';
import { HMTABLES } from '../sys/constants.js';

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
        this.setExtras();
        this.setEncumbrance();
    }

    setAbilities() {
        const { abilities } = this.data.data;

        const total = {};
        for (const stat in abilities.base) {
            let value = 0;
            let fvalue = 0;
            for (let row in abilities) {
                if (row === 'total') { continue; }
                value  += abilities[row][stat].value;
                fvalue += abilities[row][stat].fvalue;
            }
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
        let encumb = 0.0;
        const item = this.items.filter((a) => {
            const aData = a.data.data;
            // TODO: Inventory management
            if (aData.state) {
                if (a.type             === 'armor'
                    && aData.armortype !== 'shield'
                    && aData.state.equipped
                ) return false;
                return aData.state.carried;
            }
        });

        for (let i=0; i < item.length; i++) {
            encumb += item[i].data.data.weight;
        }
        this.data.data.encumb = encumb;
    }

    setExtras() {
        const {data} = this.data;
        data.sp.max = data.bonus.total?.sp || 0;
    }
}
