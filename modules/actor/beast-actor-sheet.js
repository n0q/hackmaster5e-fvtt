import { HMActorSheet } from './actor-sheet.js';

export class HMBeastActorSheet extends HMActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'actor'],
            width: 820,
            height: 970,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }]
        });
    }
}
