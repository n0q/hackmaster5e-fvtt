import { HMItemSheet } from './item-sheet.js';

export class HMWeaponItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 480,
            height: 680,
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
        const {name, value} = ev.currentTarget;
        const newTiming = Math.max(parseInt(value, 10) || 0, 0);
        await this.item.update({[name]: newTiming});

        const {timing} = this.item.system.ranged;
        const spd = Object.values(timing).reduce((a, b) => (a || 0) + (b || 0));
        await this.item.update({'system.bonus.base.spd': spd});
    }
}
