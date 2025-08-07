/**
 * Utility class for managing form button states and labels based on dynamic input changes.
 * Handles updating button disabled state and labels through configurable callbacks.
 */
export class FormmButtonManager {
    /**
     * Creates a new FormButtonManager instance.
     * @param {HTMLElement} element - The parent element containing the buttons to manage
     * @param {Object} config - Configuration object with callback functions
     * @param {Function} config.getLabel - Returns button label text.
     * @param {Function} config.isDisabled - Returns if buttons should be disabled.
     */
    constructor(element, config) {
        this.element = element;
        this.config = config;
    }

    /**
     * Updates a button's disabled state and label based on override values.
     * @param {string} buttonName - The name attribute value of the button to update
     * @param {Object} [override={}] - Object containing override values to use in calculations
     */
    updateButton(buttonName, override = {}) {
        const button = this._getButton(buttonName);
        if (!button) return;

        button.disabled = this.config.isDisabled(override);

        const labelSpan = button.querySelector("span");
        if (labelSpan) labelSpan.textContent = this.config.getLabel(override);
    }

    /**
     * Private method to find a button by its name attribute.
     * @private
     * @param {string} buttonName - The name attribute value of the button to find
     * @returns {HTMLElement|null} The button element or null if not found
     */
    _getButton(buttonName) {
        return this.element.querySelector(`button[name="${buttonName}"]`);
    }
}
