import { HMItem } from './item.js';
import { HMCONST } from '../sys/constants.js';

export class HMTalentItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepTalentData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    _prepTalentData() {
        const {system} = this;
        if (Number(system.type) !== HMCONST.TALENT.WEAPON) return;
        const [isMechanical, isRanged] = [system.weapon.mechanical, system.weapon.ranged];
        if (isMechanical || isRanged) {
            if (isMechanical && !isRanged) this.update({'system.weapon.mechanical': false});

            const {bonus} = system;
            const {def, dmg} = bonus;
            if (isRanged) bonus.def = 0;
            if (isMechanical) bonus.dmg = 0;
            const dirty = bonus.def !== def || bonus.dmg !== dmg;
            if (dirty) this.update({'system.bonus': bonus});
        }
    }
}
