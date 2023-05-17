import { HMItem } from './item.js';
import { SYSTEM_ID } from '../tables/constants.js';

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

        const useArmorDegredation = game.settings.get(SYSTEM_ID, 'armorDegredation');
        const {bonus, damage, shield, qn} = this.system;
        qn ? bonus.qual = this.quality : delete bonus.qual;

        const armorDmg = useArmorDegredation ? Number(-Math.floor(damage/10)) : 0;

        Object.keys(bonus.base).forEach((key) => {
            let sum = 0;
            Object.keys(bonus).filter((x) => x !== 'total').forEach((row) => {
               sum += (bonus[row][key] || 0);
            });
            bonus.total[key] = sum;
        });
        const totalArmorDmg = Math.max(-bonus.total.dr, armorDmg);
        bonus.total.dr += totalArmorDmg;

        this.derived = armorDmg
            ? {wear: {dr: totalArmorDmg, def: 0, init: 0, spd: 0, move: 0}}
            : undefined;

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
