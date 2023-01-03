import { HMItem } from './item.js';
import { HMCONST } from '../tables/constants.js';

export class HMTalentItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this._prepTalentData();
    }

    _prepTalentData() {
        const {system} = this;
        const type = Number(system.type);

        if (type === HMCONST.TALENT.WEAPON) {
            const {weapon} = system;
            const [isMechanical, isRanged] = [weapon.mechanical, weapon.ranged];
            if (isMechanical || isRanged) {
                if (isMechanical && !isRanged) this.update({'system.weapon.mechanical': false});

                const {bonus} = system;
                // const {def, dmg, reach} = bonus;
                if (isRanged) {
                    bonus.def = 0;
                    bonus.reach = 0;
                }
                if (isMechanical) bonus.dmg = 0;
            }

            if (this.effects.size) this.effects.forEach((fx) => fx.delete());
        } else if (type === HMCONST.TALENT.EFFECT) {
            if (this.effects.size) return;
            const changes = this.system.changes ?? [{key: '', value: '0', mode: CONST.ACTIVE_EFFECT_MODES.ADD}];
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
