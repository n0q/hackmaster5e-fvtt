import { HMItemSheet } from './item-sheet.js';

export class HMTalentItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 580,
            height: 380,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'attributes' }],
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;
        html.find('.wtalent').click(this.onSetWeaponTalent.bind(this));
    }

    async onSetWeaponTalent(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        const value = Number(!getProperty(this.item, dataset.prop));
        const valueUpdate = dataset.mult ? dataset.mult * value : value;
        await this.item.update({[dataset.prop]: valueUpdate});
    }
}
