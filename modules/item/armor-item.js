import { HMItem } from './item.js';

export class HMArmorItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepArmorData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    get quality() {
        const vector = super.quality;
        if (!this.system.shield.checked) {
            const {def} = this.system.bonus.base;
            vector.def = Math.min(vector.def, -def);
        }
        return vector;
    }

    _prepArmorData({setBonus=true}={}) {
        if (!this.actor?.system) return;

        const {bonus, shield, qn} = this.system;
        qn ? bonus.qual = this.quality : delete bonus.qual;

        Object.keys(bonus.base).forEach((key) => {
            let sum = 0;
            Object.keys(bonus).filter((x) => x !== 'total').forEach((row) => {
               sum += (bonus[row][key] || 0);
            });
            bonus.total[key] = sum;
        });

        // Populate armor and shield vectors on actor.
        // TODO: Items should never do this to actors.
        if (setBonus && this.invstate === 'equipped') {
            const actorBonus = this.actor.system.bonus;
            const aVector = actorBonus?.armor || {};
            const sVector = actorBonus?.shield || {};
            const sum = shield.checked ? sVector : aVector;

            Object.keys(bonus.total).forEach((key) => {
                sum[key] = (sum[key] || 0) + bonus.total[key];
            });

            shield.checked ? actorBonus.shield = sum
                           : actorBonus.armor  = sum;
        }
    }
}
