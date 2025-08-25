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

    /**
     * Apply damage to this armor item.
     * Maximum damage is based on the armor's undamaged DR value (base + mod + quality).
     * Excludes wear penalties when calculating maximum damage capacity.
     *
     * @async
     * @param {number} input - Amount of damage to apply
     */
    async damageArmorBy(input) {
        const value = Number(input) || 0;
        const { damage } = this.system;
        const maxDamage = 10 * this.bonus
            .getUnitsForStat("dr")
            .filter(u => u.vector !== "wear")
            .reduce((acc, u) => acc + u, 0);
        console.warn(maxDamage);
        const newDamage = Math.clamp(damage + value, 0, maxDamage);
        await this.update({ "system.damage": newDamage });
    }
}

