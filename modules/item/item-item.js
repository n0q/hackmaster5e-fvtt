import { HMItem } from './item.js';

export class HMItemItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepItemData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    _prepItemData() {
        if (!this.actor?.system) return;

        const {qty} = this.system;
        if (Number.isInteger(qty) && qty > 0) return;
        const newqty = Math.max(1, parseInt(qty, 10)) || 1;
        this.update({'system.qty': newqty});
    }
}
