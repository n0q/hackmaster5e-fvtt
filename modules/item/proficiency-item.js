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
        const {system} = this;
        if (system.mechanical.checked && !system.ranged.checked) {
            this.update({'system.mechanical.checked': false});
        }
    }
}
