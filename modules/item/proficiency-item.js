import { HMItem } from './item.js';

export class HMProficiencyItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepProficiencyData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    // TODO: A user can technically set defense and damage, then
    // set a weapon to ranged. These values should be culled.
    _prepProficiencyData() {
        const {data} = this.data;
        if (data.mechanical.checked && !data.ranged.checked) {
            this.update({'data.mechanical.checked': false});
        }
    }
}
