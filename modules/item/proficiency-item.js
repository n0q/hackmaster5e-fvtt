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
        const {bonus} = system;
        const [isMechanical, isRanged] = [system.mechanical.checked, system.ranged.checked];

        let dirty = false;
        if (bonus.spd > 0) {
            bonus.spd = -Math.abs(bonus.spd);
            dirty = true;
        }

        if (isMechanical || isRanged) {
            if (isMechanical && !isRanged) this.update({'system.mechanical.checked': false});

            const {def, dmg} = bonus;
            if (isRanged) bonus.def = 0;
            if (isMechanical) bonus.dmg = 0;
            dirty = dirty || bonus.def !== def || bonus.dmg !== dmg;
        }
        if (dirty) this.update({'system.bonus': bonus});
    }
}
