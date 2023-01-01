import { HMItem } from './item.js';
import { HMCONST } from '../tables/constants.js';

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
        const type = Number(system.type);

        if (type === HMCONST.TALENT.WEAPON) {
            const [isMechanical, isRanged] = [system.weapon.mechanical, system.weapon.ranged];
            if (isMechanical || isRanged) {
                if (isMechanical && !isRanged) this.update({'system.weapon.mechanical': false});

                const {bonus} = system;
                const {def, dmg, reach} = bonus;
                if (isRanged) {
                    bonus.def = 0;
                    bonus.reach = 0;
                }
                if (isMechanical) bonus.dmg = 0;
                const dirty = bonus.def !== def || bonus.dmg !== dmg || bonus.reach !== reach;
                if (dirty) this.update({'system.bonus': bonus});
            }
            if (this.effects.size) this.effects.forEach((fx) => fx.delete());
        } else if (type === HMCONST.TALENT.EFFECT) {
            if (this.effects.size) return;
            const changes = [{key: '', value: '0', mode: CONST.ACTIVE_EFFECT_MODES.ADD}];
            const aeData = {label: this.name, changes};
            this.createEmbeddedDocuments('ActiveEffect', [aeData]);
        }
    }

    setWeaponTalent(key) {
        const {bonus} = this.system;
        const value = Number(!bonus[key]);
        bonus[key] = key === 'spd' ? -value : value;
        this.update({'system.bonus': bonus});
    }

    onClick(ev) {
        const {dataset} = ev.currentTarget;
        if (dataset.key) this.setWeaponTalent(dataset.key);
    }
}
