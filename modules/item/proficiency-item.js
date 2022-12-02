import { HMItem } from './item.js';

export class HMProficiencyItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepProficiencyData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    _prepProficiencyData() {
        const {system} = this;
        const [isMechanical, isRanged] = [system.mechanical.checked, system.ranged.checked];
        if (isMechanical || isRanged) {
            if (isMechanical && !isRanged) this.update({'system.mechanical.checked': false});

            const {bonus} = system;
            const {def, dmg} = bonus;
            if (isRanged) bonus.def = 0;
            if (isMechanical) bonus.dmg = 0;
            const dirty = bonus.def !== def || bonus.dmg !== dmg;
            if (dirty) this.update({'system.bonus': bonus});
        }
    }
}
