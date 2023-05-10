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

    get _manifestData() {
        return this.system.container._manifest.map((a) => JSON.parse(a));
    }

    get hmContents() {
        return this._manifestData.map((a) => {
            const item = new CONFIG.Item.documentClass(a);
            item.rootId = this.rootId ? this.rootId : this._id;
            item.container = this;
            return item;
        });
    }
}
