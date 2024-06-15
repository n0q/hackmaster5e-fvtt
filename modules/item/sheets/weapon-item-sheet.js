import { HMItemSheet } from './item-sheet.js';

export class HMWeaponItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 680,
            height: 525,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;
        html.find('.timing').change(this.onChangeTiming.bind(this));
    }

    async onChangeTiming(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const {dataset, value} = ev.currentTarget;
        const newValue = {[dataset.key]: Math.max(parseInt(value, 10) || 0, 0)};
        const timing = {...this.item.system.ranged.timing, ...newValue};
        const spd = Object.values(timing).reduce((a, b) => (a || 0) + (b || 0));
        await this.item.update({
            'system.bonus.base.spd': spd,
            'system.ranged.timing': timing,
        });
    }
}
