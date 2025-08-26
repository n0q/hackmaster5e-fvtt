import { HMItem } from "./item.js";
import { HMAggregator } from "../rules/aggregator.js";

export class HMProficiencyItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
        // We're reading vectors from a getter, so pathing will be invalid.
        this.hmagg = new HMAggregator({ parent: this }, { noprop: false, readonly: true });
        this._prepProficiencyData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    /**
     * @param {HMAggregator} aggregator
     */
    _postAggregation(aggregator) {
        const { system } = this;
        const [isMechanical, isRanged] = [system.mechanical.checked, system.ranged.checked];

        const speedUnits = aggregator.getUnitsForStat("spd");
        speedUnits.forEach(unit => unit > 0 && (unit.value = -unit));

        if (isRanged) aggregator.deleteUnitsByStat("def");
        if (isMechanical) aggregator.deleteUnitsByStat("dmg");
    }

    _prepProficiencyData() {
        const { system } = this;
        if (system.mechanical.checked && !system.ranged.checked) {
            this.update({ "system.mechanical.checked": false });
        }
    }
}
