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

    _prepArmorData() {
        if (!this.actor?.system) return;

        const useArmorDegredation = game.settings.get(SYSTEM_ID, 'armorDegredation');
        const {bonus, damage, qn} = this.system;
        qn ? bonus.qual = this.quality : delete bonus.qual;

        const adjDamage = Math.max(damage, 0);
        const armorDmg = useArmorDegredation ? Number(-Math.floor(adjDamage/10)) : 0;

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
    }

    damageArmorBy(input) {
        const value = Number(input) || 0;
        const {bonus, damage} = this.system;
        const maxDamage = 10 * (bonus.base.dr + bonus.mod.dr + (bonus?.qual?.dr || 0));
        const newDamage = Math.clamped(damage + value, 0, maxDamage);
        this.update({'system.damage': newDamage});
    }

    async onClick(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        if (dataset.op === 'admg') console.warn('admg');
    }
}
