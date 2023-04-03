import { HMTABLES } from '../tables/constants.js';
import { HMItem } from './item.js';

export class HMClassItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepCClassData();
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
            return;
        }

        if (!this.actor) return;

        // calculate hp
        system.level = Math.clamped((system.level || 0), 0, 20);
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

        const bonus = {
            'hp':       hp + Math.max(...hpStack) + (system.hp || 0),
            'turning':  level,
            'dodge':    level,
            'mental':   level,
            'physical': level,
            'top':      (system.top_cf || 0.01) * level,
        };

        // grab the level data off the ptable
        const {features} = system;
        Object.keys(features).forEach((idx) => {
            bonus[idx] = features[idx] ? pTable[level]?.[idx]?.value || 0 : 0;
        });

        system.bonus = bonus;
    }
}
