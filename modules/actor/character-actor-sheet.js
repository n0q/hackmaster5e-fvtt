import { HMActorSheet } from './actor-sheet.js';

export class HMCharacterActorSheet extends HMActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'actor'],
            width: 835,
            height: 980,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }],
        });
    }

    /** @override */
    getData() {
        const data = super.getData();

        this._prepareCharacterItems(data);
        return data;
    }

    _HMprepareSheet(sheetData) {
        const actorData = sheetData.actor;

        const {priors} = actorData.system;
        priors.weight = HMTABLES.weight(priors.bmi || 0, priors.height || 0);

        // Saves
        const left = ['fos', 'foa', 'turning', 'morale'];
        const right = ['physical', 'mental', 'dodge', 'poison', 'trauma'];
        actorData.saves = {left, right};
    }
}
