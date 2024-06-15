import { HMItemSheet } from './item-sheet.js';

export class HMSpellItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 520,
            height: 390,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;
        html.find('.saves').on('change', this.onSaveEdit.bind(this));
    }

    async onSaveEdit(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const {dataset, value} = ev.target;

        let {save} = this.item.system;
        if (!save) save = {type: 0, action: 0};
        save[dataset.save] = value;
        await this.item.update({'system.save': save});
    }
}
