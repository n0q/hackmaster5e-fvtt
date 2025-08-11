import { HMCONST, systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";
import { FormButtonManager } from "./foundation/components/form-button-manager.js";
import { calculateCritFormula, calculateCritSeverity } from "../rules/processors/critical-processor.js";

/**
 * Critical hit application.
 * @extends {HMApplication}
 */
export class CriticalPrompt extends HMApplication {
    /** @inheritdoc */
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/critical-content-app.hbs"),
            classes: ["flexrow"],
        },
        control: {
            template: "templates/generic/form-footer.hbs",
            classes: ["dialog-buttons"],
        },
    };

    static #OVERRIDE_OPTIONS = {
        actions: { rollSubmit: HMApplication.submitAction },
        form: { submitOnChange: true },
        position: { width: 550 },
    };

    /** @inheritdoc */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        this.#OVERRIDE_OPTIONS,
        { inplace: false },
    );

    /** @inheritdoc */
    async _preparePartContext(partId, context) {
        if (partId === "control") context = this.prepareControlParts(context);
        return super._preparePartContext(partId, context);
    }

    prepareControlParts(context) {
        context.buttons = [{
            type: "submit",
            icon: "fa-solid fa-dice-d20",
            name: "roll-submit",
            action: "rollSubmit",
            label: "label",
            disabled: true,
        }];

        return context;
    }

    /** @inheritdoc */
    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);
        context.atkSize = HMCONST.SCALE.MEDIUM;
        context.defSize = HMCONST.SCALE.MEDIUM;
    }

    async _onFirstRender(...args) {
        super._onFirstRender(...args);

        this.buttonManager = new FormButtonManager(this.element, [{
            name: "roll-submit",
            getLabel: formValues => this.getSubmitButtonLabel(formValues),
            isDisabled: formValues => this.isSubmitButtonDisabled(formValues),
        }]);
    }

    /**
     * Callback to button manager to change button label.
     *
     * @param {Object} formValues
     * @returns {string}i
     */
    getSubmitButtonLabel(formValues) {
        const formula = calculateCritFormula(formValues);
        const severity = calculateCritSeverity(formValues);
        return `Roll ${formula} (Severity ${severity})`;
    }

    /**
     * Callback to button manager to control button state.
     *
     * @param {Object} formValues
     * @returns {boolean}
     */
    isSubmitButtonDisabled(formValues) {
        const severity = calculateCritSeverity(formValues);
        return severity < 1;
    }

    async close(options) {
        this.buttonManager.destroy();
        super.close(options);
    }
}
