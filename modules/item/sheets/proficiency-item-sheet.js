import { HMItemSheet } from "./item-sheet.js";

/**
 * Legacy code. Do not enhance.
 *
 * This module is actively used but architecturally abandoned and awaiting a complete
 * rewrite. Do not invest time in refactoring. Just make your minimal needed changes
 * and then get out.
 *
 * @deprecated 0.5.0
 */
export class HMProficiencyItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["hackmaster", "sheet", "item"],
            width: 480,
            height: 280,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }],
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Uncheck mechanical when ranged is unchecked
        html.find('input[name="system.ranged.checked"]').change(event => {
            if (!event.target.checked) {
                html.find('input[name="system.mechanical.checked"]').prop('checked', false).trigger('change');
            }
        });
    }
}
