import { HMCONST } from "../tables/constants.js";
import { HMItem } from "./item.js";
import { HMAggregator } from "../rules/aggregator/aggregator.js";

export class HMTalentItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        this._prepTalentData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        // We're reading vectors from a getter, so pathing will be invalid.
        this.hmagg = new HMAggregator({ parent: this }, { noprop: false, readonly: true });
    }

    /**
     * @param {HMAggregator} aggregator
     */
    _postAggregation(aggregator) {
        if (this.system.type !== HMCONST.TALENT.WEAPON) {
            aggregator.deleteVector("base");
            return;
        }

        const { isRanged, isMechanical } = this.system;

        if (isRanged) {
            aggregator.deleteUnitsByStat("def");
            aggregator.deleteUnitsByStat("reach");
        }

        if (isMechanical) {
            aggregator.deleteUnitsByStat("dmg");
        }
    }

    _prepTalentData() {
        const { system } = this;
        const type = Number(system.type);

        if (type !== HMCONST.TALENT.EFFECT) {
            if (this.effects.size > 0) {
                this.effects.forEach(fx => fx.delete());
            }
            return;
        }

        if (this.effects.size) return;
        const defaultEffect = [{ key: "", value: "0", mode: CONST.ACTIVE_EFFECT_MODES.ADD }];
        const changes = this.system.changes ?? defaultEffect;
        const aeData = { label: this.name, changes };
        this.createEmbeddedDocuments("ActiveEffect", [aeData]);
    }

    /**
     * @param {string} key
     */
    setWeaponTalent(key) {
        const { bonus } = this.system;
        const value = Number(!bonus[key]);
        bonus[key] = key === "spd" ? -value : value;
        this.update({ "system.bonus": bonus });
    }

    /**
     * @param {Event} ev
     */
    onClick(ev) {
        const { dataset } = ev.currentTarget;
        if (dataset.key) this.setWeaponTalent(dataset.key);
    }
}
