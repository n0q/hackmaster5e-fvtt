import { HMItem } from './item.js';

export class HMArmorItem extends HMItem {
    prepareBaseData(options={}) {
        super.prepareBaseData();
        this._prepArmorData(options);
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    _prepArmorData({setBonus=true}={}) {
        if (!this.actor?.data) return;

        const {bonus, shield, qn} = this.data.data;
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
            const actorBonus = this.actor.data.data.bonus;
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
