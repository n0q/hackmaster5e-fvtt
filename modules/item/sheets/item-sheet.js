export class HMItemSheet extends ItemSheet {
  /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 520,
            height: 480,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
        });
    }

    /** @override */
    get template() {
        const path = 'systems/hackmaster5e/templates/item';
        return `${path}/item-${this.item.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find('.sheet-body');
        const bodyHeight = position.height - 192;
        sheetBody.css('height', bodyHeight);
        return position;
    }

  /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;

        html.find('.editable').change(this._onEdit.bind(this));

        $(document).ready(() => $('.autoselect').focus(function autoselect() { $(this).select(); }));
    }

    async _onEdit(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const {dataset} = ev.currentTarget;
        const {item}    = this;

        if (dataset.itemProp) {
            const {itemProp, dtype} = dataset;
            let targetValue = ev.target.value;
            if (dtype === 'Number') { targetValue = parseInt(targetValue, 10);               } else
            if (dtype === 'uint')   { targetValue = Math.max(parseInt(targetValue, 10), 0);  } else
            if (dtype === 'Float')  { targetValue = parseFloat(targetValue);                 } else
            if (dtype === 'Percent') {
                const pctMatch = targetValue.match(/^([0-9]+)%$/);
                const floatMatch = targetValue.match(/^([0-9]?\.[0-9]+)$/);
                if (pctMatch)   { targetValue = parseFloat(pctMatch[1]) / 100;   } else
                if (floatMatch) { targetValue = parseFloat(floatMatch[1]);       } else
                                { targetValue = parseInt(targetValue, 10) / 100; } // eslint-disable-line
            }
            setProperty(item, itemProp, targetValue);
            await this.item.update({system:item.system});
            this.render(true);
        }
    }
}
