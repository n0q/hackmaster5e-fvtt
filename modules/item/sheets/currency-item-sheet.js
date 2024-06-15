import { HMItemSheet } from './item-sheet.js';

export class HMCurrencyItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 500,
            height: 260,
        });
    }
}
