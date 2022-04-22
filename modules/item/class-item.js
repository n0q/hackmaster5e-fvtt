import { HMTABLES } from '../sys/constants.js';
import { HMItem } from './item.js';

export class HMClassItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepCClassData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    async _prepCClassData() {
        const {data} = this.data;
        const pTable = data.ptable;

        // initialize new cclass object ptable
        if (Object.entries(pTable).length === 0) {
            const {pData} = HMTABLES.skill;
            for (let i = 1; i < 21; i++) pTable[i] = deepClone(pData);
            if (Object.entries(pTable).length) return;
            await this.update({'data.ptable': pTable});
        }

        if (!this.actor?.data) return;

        // calculate hp
        const level = Math.clamped((data.level || 0), 0, 20);
        if (level < 1) {
            delete data.bonus;
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
            'hp':       hp + Math.max(...hpStack),
            'turning':  level,
            'dodge':    level,
            'mental':   level,
            'physical': level,
            'top':      (data.top_cf || 0.01) * level,
        };

        // grab the level data off the ptable
        const {features} = data;
        Object.keys(features).forEach((idx) => {
            bonus[idx] = features[idx] ? pTable[level][idx].value || 0 : 0;
        });

        data.bonus = bonus;
    }
}
