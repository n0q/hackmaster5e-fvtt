import { HMItemSheet } from './item-sheet.js';

export class HMClassItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 520,
            height: 790,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'config' }],
        });
    }
}
