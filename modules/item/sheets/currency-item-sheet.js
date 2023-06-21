import { HMItemSheet } from './item-sheet.js';

export class HMCurrencyItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 610,
            height: 490,
        });
    }
}
