import { HMTABLES } from '../sys/constants.js';
import { HMItem } from './item.js';

export class HMRaceItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();

        const {system} = this;
        const {bonus, scale} = system;
        const scaleTable = HMTABLES.scale;
        Object.keys(scale).forEach((key) => {
            const idx = system.scale[key];
            if (idx > 0) bonus[key] = scaleTable[idx][key];
        });
    }

    get movespd() {
        const raceMove = this.system.bonus.move || 0;
        return Object.values(HMTABLES.movespd).map((x) => x * raceMove);
    }

    getScale(key) {
        const {scale, bonus} = this.system;
        if (key in scale === false) return undefined;
        const scaleRef = Number(scale[key]);
        if (scaleRef) return scaleRef;

        // Custom bonus requires best-fit for category.
        const scaleBonus = Number(bonus[key]);
        const scaleTable = HMTABLES.scale;
        const scaleList = Object.keys(scaleTable).map((x) => scaleTable[x][key]);
        scaleList[scaleList.length - 1] = Infinity;

        return scaleList.findIndex((x) => scaleBonus <= Number(x)) + 1;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}
