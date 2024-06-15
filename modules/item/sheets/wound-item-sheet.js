import { HMItemSheet } from './item-sheet.js';

export class HMWoundItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 280,
            height: 215,
        });
    }
}
