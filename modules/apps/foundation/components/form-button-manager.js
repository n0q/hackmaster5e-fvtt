/**
 * Utility class for managing form button states and labels based on dynamic input changes.
 * Handles binding to form inputs and updating buttons when values change.
 */
export class FormButtonManager {
    #listeners = new Map();

    #form = null;

    #formListener = null;

    /**
     * Creates a new FormButtonManager instance.
     *
     * @param {HTMLElement} element - The parent element containing the buttons to manage
     * @param {Object[]} buttons - Array of button configurations
     * @param {string} buttons[].name - The name attribute of the button to manage
     * @param {string[]} [buttons[].watch] - Array of input names to watch (default: all form inputs)
     * @param {Function} buttons[].getLabel - Returns button label based on form data
     * @param {Function} buttons[].isDisabled - Returns if button should be disabled based on form data
     * @param {Function} [buttons[].transform] - Optional transform for watched values before passing to callbacks
     */
    constructor(element, buttons = []) {
        this.element = element;
        this.buttons = buttons;
        this.#form = element.closest("form");

        if (this.#form) {
            this._bindButtons();
        }
    }

    /**
     * Binds all configured buttons and sets up event listeners.
     *
     * @private
     */
    _bindButtons() {
        for (const config of this.buttons) {
            this._updateButton(config);
        }

        const hasUnspecifiedWatchers = this.buttons.some(btn => !btn.watch || btn.watch.length === 0);

        if (hasUnspecifiedWatchers) {
            this.#formListener = event => {
                if (event.target.matches("input, select, textarea")) {
                    this._handleInputChange(event);
                }
            };
            this.#form.addEventListener("input", this.#formListener);
        } else {
            // Bind specific listeners for watched inputs
            for (const config of this.buttons) {
                this._bindButtonWatchers(config);
            }
        }
    }

    /**
     * Binds event listeners for specific inputs watched by a button.
     *
     * @private
     * @param {Object} config - Button configuration
     */
    _bindButtonWatchers(config) {
        if (!config.watch) return;

        for (const inputName of config.watch) {
            const input = this.#form.querySelector(`[name="${inputName}"]`);
            if (!input) continue;

            // Only add listener if we haven't already for this input
            if (!this.#listeners.has(input)) {
                const eventType = this._getEventType(input);
                const listener = () => this._handleInputChange({ target: input });
                input.addEventListener(eventType, listener);
                this.#listeners.set(input, listener);
            }
        }
    }

    /**
     * Handles input change events and updates relevant buttons.
     * @private
     * @param {Event} event - The input change event
     */
    _handleInputChange(event) {
        const inputName = event.target.name;

        for (const config of this.buttons) {
            // Update if this button watches this input, or watches everything (no watch specified)
            if (!config.watch || config.watch.length === 0 || config.watch.includes(inputName)) {
                this._updateButton(config);
            }
        }
    }

    /**
     * Updates a button's disabled state and label based on current form values.
     *
     * @private
     * @param {Object} config - Button configuration
     */
    _updateButton(config) {
        const button = this._getButton(config.name);
        if (!button) return;

        const formValues = this._getFormValues(config);

        if (config.isDisabled) {
            button.disabled = config.isDisabled(formValues);
        }

        if (config.getLabel) {
            const labelSpan = button.querySelector("span");
            if (labelSpan) {
                labelSpan.textContent = config.getLabel(formValues);
            }
        }
    }

    /**
     * Gets the current form data, optionally filtered to watched inputs.
     *
     * @private
     * @param {Object} config - Button configuration
     * @returns {Object} Form data object
     */
    _getFormValues(config) {
        const formData = new FormData(this.#form);
        const data = {};

        if (config.watch && config.watch.length > 0) {
            for (const name of config.watch) {
                const value = formData.get(name);
                data[name] = config.transform ? config.transform(value, name) : value;
            }
        } else {
            for (const [name, value] of formData.entries()) {
                data[name] = config.transform ? config.transform(value, name) : value;
            }
        }

        return data;
    }

    /**
     * Determines the appropriate event type for an element.
     *
     * @private
     * @param {HTMLElement} element - The element to check
     * @returns {string} The event type to listen for
     */
    _getEventType(element) {
        if (element.type === "checkbox" || element.type === "radio") {
            return "change";
        }
        return "input";
    }

    /**
     * Finds a button by its name attribute.
     *
     * @private
     * @param {string} buttonName - The name attribute value of the button
     * @returns {HTMLElement|null} The button element or null if not found
     */
    _getButton(buttonName) {
        return this.element.querySelector(`button[name="${buttonName}"]`);
    }

    /**
     * Manually trigger an update for all buttons.
     */
    update() {
        for (const config of this.buttons) {
            this._updateButton(config);
        }
    }

    /**
     * Remove all listeners and clean up.
     * Call this before destroying the component or when the form is being removed.
     */
    destroy() {
        // Remove individual input listeners
        for (const [input, listener] of this.#listeners) {
            const eventType = this._getEventType(input);
            input.removeEventListener(eventType, listener);
        }
        this.#listeners.clear();

        // Remove form-wide listener if it exists
        if (this.#formListener && this.#form) {
            this.#form.removeEventListener("input", this.#formListener);
            this.#formListener = null;
        }

        this.buttons = [];
    }

    /**
     * Add a new button configuration dynamically.
     *
     * @param {Object} config - Button configuration
     */
    addButton(config) {
        this.buttons.push(config);
        this._bindButtonWatchers(config);
        this._updateButton(config);
    }

    /**
     * Remove a button configuration.
     *
     * @param {string} buttonName - The name of the button to remove
     */
    removeButton(buttonName) {
        const index = this.buttons.findIndex(btn => btn.name === buttonName);
        if (index === -1) return;

        this.buttons.splice(index, 1);
        // Note: We don't remove listeners here as other buttons might use them
    }
}
