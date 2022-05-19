import { HMTABLES } from '../sys/constants.js';
import { HMItem } from './item.js';

export class HMRaceItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();

        const {data} = this.data;
        const {bonus, scale} = data;
        const scaleTable = HMTABLES.scale;
        Object.keys(scale).forEach((key) => {
            const idx = data.scale[key];
            if (idx > 0) { bonus[key] = scaleTable[idx][key]; }
        });
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}
