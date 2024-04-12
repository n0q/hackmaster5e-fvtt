import { HMTABLES } from '../tables/constants.js';
import { HMItem } from './item.js';

export class HMClassItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepCClassData();
        if (!this.actor) return;
        this.setHP();
        this.setBonusTotal();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    _prepCClassData() {
        const {system} = this;
        const pTable = system.ptable;

        // initialize new cclass object ptable
        if (Object.entries(pTable).length === 0) {
            const {pData} = HMTABLES.cclass;
            for (let z = 1; z < 21; z++) pTable[z] = deepClone(pData);
            this.update({'system.ptable': pTable});
        }

        system.level = Math.clamped((system.level || 0), 0, 20);
    }

    setHP() {
        const {system} = this;
        const pTable = system.ptable;

        const {level} = system;
        if (level < 1) {
            delete system.bonus;
            return;
        }

        let hp = 0;
        let rerolled = false;
        let hpStack = [];
        let i = 0;
        while (i++ < level) {
            const {reroll} = pTable[i].hp;

            // end of a reroll chain
            if (!reroll && rerolled) {
                hp += Math.max(...hpStack);
                rerolled = false;
                hpStack = [];
            }

            // there was no reroll chain
            if (!reroll && !rerolled && hpStack.length === 1) {
                hp += hpStack.pop();
            }

            hpStack.push(parseInt(pTable[i].hp.value, 10) || 0);
            if (reroll) rerolled = true;
        }

        system.bonus = {hp: hp + Math.max(...hpStack) + (system.hp || 0)};
    }

    setBonusTotal() {
        const {system} = this;
        const pTable = system.ptable;
        const {features, level} = system;

        const bonus = {
            turning:  level,
            dodge:    level,
            mental:   level,
            physical: level,
            top:      (system.top_cf || 0.01) * level,
        };

        // grab the level data off the ptable
        Object.keys(features).forEach((idx) => {
            bonus[idx] = features[idx] ? pTable[level]?.[idx]?.value || 0 : 0;
        });

        // max spell level for saves and volatility checks
        let slvl = parseInt(level, 10) || 1;
        if (features.slvl) {
            let row = level + 1;
            while (row > 1 && !parseInt(pTable[--row].slvl.value, 10));
            slvl = (parseInt(pTable[row].slvl.value, 10) || 0) - 2;
        }
        bonus.slvl = Math.max(slvl, 0);
        Object.assign(system.bonus, bonus);
    }
}
