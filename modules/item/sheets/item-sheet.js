import { DATA_TYPE_PARSERS } from "../../sys/utils.js";

/**
 * Legacy code. Do not enhance.
 *
 * This module is actively used but architecturally abandoned and awaiting a complete
 * rewrite. Do not invest time in refactoring. Just make your minimal needed changes
 * and then get out.
 *
 * @deprecated 0.5.0
 */
export class HMItemSheet extends foundry.appv1.sheets.ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["hackmaster", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
        });
    }

    /** @override */
    get template() {
        const path = "systems/hackmaster5e/templates/item";
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
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;

        html.find(".editable").change(this._onEdit.bind(this));

        $(document).ready(() => $(".autoselect").focus(function autoselect() { $(this).select(); }));
    }

    async _onEdit(event) {
        event.preventDefault();
        event.stopPropagation();

        const { dataset } = event.currentTarget;
        const { itemProp, dtype } = dataset;
        if (!itemProp) return;

        const rawValue = event.target.value;
        const parser = DATA_TYPE_PARSERS[dtype];

        const targetValue = parser ? parser(rawValue) : rawValue;

        await this.item.update({ [itemProp]: targetValue });
        this.render(true);
    }
}
