import { HMItemSheet } from './item-sheet.js';
import { DATA_TYPE_PARSERS } from '../../sys/utils.js';

export class HMCurrencyItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 500,
            height: 260,
        });
    }

    /**
     * Temporary work-around for trying to do partial updates to system.coins.
     * This is only used by the currency sheet. Since the schema defines system.coins
     * as a free-form ObjectField, we are not free to modify individual values of that object,
     * but must instead change the entire object at once. This function clones system.coins,
     * changes it based on the itemProp, and then updates system.coins.
     *
     * @override
     * @hack
     * @async
     * @private
     *
     * @param {jQuery.Event} event - The change event triggered by editing a field.
     */
    async _onEdit(event) {
        event.preventDefault();
        event.stopPropagation();

        const { dataset } = event.currentTarget;
        const { itemProp, dtype } = dataset;
        if (!itemProp) return;

        const rawValue = event.target.value;
        const parser = DATA_TYPE_PARSERS[dtype];

        const targetValue = parser ? parser(rawValue) : rawValue;

        if (itemProp.startsWith('system.coins')) {
            const coins = foundry.utils.deepClone(this.item.system.coins);
            const targetKey = itemProp.replace('system.coins.', '');

            const isDirty = foundry.utils.setProperty(coins, targetKey, targetValue);
            if (isDirty) await this.item.update({ 'system.coins': coins });
        } else await this.item.update({ [itemProp]: targetValue });
    }
}
