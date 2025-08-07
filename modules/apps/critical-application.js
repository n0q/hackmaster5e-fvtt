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
            label: this.getButtonLabel(),
            action: "rollSubmit",
            disabled: this.isButtonDisabled(),
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

        const buttonConfig = {
            getLabel: override => this.getButtonLabel(override),
            isDisabled: override => this.isButtonDisabled(override),
        };

        this.buttonManager = new FormButtonManager(this.element, buttonConfig);
    }

    _onInputChange(event) {
        const override = { [event.target.name]: Number(event.target.value) };
        this.buttonManager.updateButton("roll-submit", override);
    }

    getButtonLabel(override = {}) {
        const result = { ...this.result, ...override };
        const formula = calculateCritFormula(result || {});
        const severity = calculateCritSeverity(result || {});

        return `Roll ${formula} (Severity ${severity})`;
    }

    isButtonDisabled(override = {}) {
        const result = { ...this.result, ...override };
        const severity = calculateCritSeverity(result || {});

        return severity < 1;
    }
}
