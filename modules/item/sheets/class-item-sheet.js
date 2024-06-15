import { HMItemSheet } from './item-sheet.js';

export class HMClassItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 640,
            height: 810,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;

        html.find('.feature').change(this._newFeature.bind(this));
    }

    async _newFeature(ev) {
        if (!ev.target.checked) return;
        ev.preventDefault();

        const {feature} = ev.currentTarget.dataset;
        const {item} = this;
        const {ptable} = item.system;

        const propExists = Object.prototype.hasOwnProperty.call(ptable[1], feature);
        if (propExists) return;

        const newRow = {value: 0};
        Object.keys(ptable).forEach((row) => { ptable[row][feature] = newRow; });
        await item.update({'system.ptable': ptable});
    }
}
