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

    get items() {
        return new foundry.utils.Collection(this._manifestData.map((a) => {
            const item = new CONFIG.Item.documentClass(a); // eslint-disable-line
            item.rootId = this.rootId ? this.rootId : this._id;
            item.container = this;
            item.ownership = this.parent ? this.parent.ownership : this.ownership;
            return [item._id, item];
        }));
    }

    get capacity() {
        const {qty, container} = this.system;
        if (!container.enabled) return 0;
        return (qty || 0) * (container.capacity || 0);
    }

    get qtyInner() {
        return this.items.reduce((acc, item) => acc + item.system.qty, 0) || 0;
    }

    get itemTypes() {
        const types = Object.fromEntries(game.documentTypes.Item.map((t) => [t, []]));
        this.items.contents.forEach((item) => types[item.type].push(item));
        return types;
    }
}
