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
            if (idx > 0) { bonus[key] = scaleTable[idx][key]; }
        });
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}
