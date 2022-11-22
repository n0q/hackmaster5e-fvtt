import { HMItemSheet } from './item-sheet.js';

export class HMSpellItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 500,
            height: 390,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
        });
    }
}
