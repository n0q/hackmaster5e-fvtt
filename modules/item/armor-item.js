import { HMItem } from "./item.js";
import { HMAggregator } from "../rules/aggregator.js";
import { HMCONST } from "../tables/constants.js";

export class HMArmorItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        const label = this.system.isShield ? "shield" : "armor";
        this.bonus = new HMAggregator({ parent: this, label }, { noprop: false });
    }

    _postAggregation(aggregator) {
        const { qn, damage } = this.system;
        if (qn !== 0) {
            const qualData = {
                vector: "qual",
                units: { dr: qn, def: qn },
                source: this,
                label: "Quality",
                path: "system.qn",
            };

            aggregator.addVector(qualData);
        }

        if (damage >= 10) {
            const wear = -Math.floor(damage / 10);
            const armorDamageData = {
                vector: "wear",
                units: { dr: wear },
                source: this,
                label: "Damaged",
                path: null,
            };

            aggregator.addVector(armorDamageData);
        }
    }

    get canPropagate() {
        return this.system.state === HMCONST.ITEM_STATE.EQUIPPED;
    }

    get quality() {
        const vector = super.quality;
        if (!this.system.isShield) {
            const { def } = this.bonus.vectors.base;
            vector.def = Math.min(vector.def, -def);
        }
        return vector;
    }

    damageArmorBy(input) {
        const value = Number(input) || 0;
        const { bonus, damage } = this.system;
        const maxDamage = 10 * (bonus.base.dr + bonus.mod.dr + (bonus?.qual?.dr || 0));
        const newDamage = Math.clamp(damage + value, 0, maxDamage);
        this.update({ "system.damage": newDamage });
    }
}
