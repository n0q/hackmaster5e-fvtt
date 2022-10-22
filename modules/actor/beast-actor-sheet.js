import { HMActorSheet } from './actor-sheet.js';

export class HMBeastActorSheet extends HMActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'actor'],
            width: 665,
            height: 770,
            tabs: [
                { navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'overview'    },
                { navSelector: '.bio-tabs',   contentSelector: '.bio-body',   initial: 'description' },
            ],
        });
    }

    /** @override */
    getData() {
        const data = super.getData();
        return data;
    }

    _HMprepareSheet(sheetData) {
        const actorData = sheetData.actor;

        // Saves
        const left = ['fos', 'foa', 'tenacity', 'will'];
        const right = ['physical', 'mental', 'dodge', 'poison', 'trauma'];
        actorData.saves = {left, right};
    }
}
