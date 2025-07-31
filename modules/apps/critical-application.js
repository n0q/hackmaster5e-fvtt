import { HMCONST, systemPath } from "../tables/constants.js";
import { HMApplication } from "./application-abstract.js";
import { calculateCritFormula, calculateCritSeverity } from "../rules/calculators/critical-calculator.js";

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
        }
    };

    static #OVERRIDE_OPTIONS = {
        actions: { rollSubmit: CriticalPrompt.submitAction },
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
    _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        this.render({ parts: ["control"] });
    }

    /** @inheritdoc */
    async _preparePartContext(partId, context) {
        if (partId === "control") context = this.prepareControlParts(context);
        return super._preparePartContext(partId, context);
    }

    prepareControlParts(context) {
        const formula = calculateCritFormula(this.result || {});
        const severity = calculateCritSeverity(this.result || {});

        context.buttons = [{
            type: "submit",
            icon: "fa-solid fa-dice-d20",
            label: `Roll ${formula} (Severity ${severity})`,
            action: "rollSubmit",
            disabled: severity < 1,
        }];

        return context;
    }

    /** @inheritdoc */
    async _preFirstRender(context, _options) {
        super._preFirstRender(context, _options);
        context.atkSize = HMCONST.SCALE.MEDIUM;
        context.defSize = HMCONST.SCALE.MEDIUM;
    }

    /**
     * Handles the submit action by marking the action as confirmed
     * and closing the associated component or dialog.
     *
     * @param {SubmitEvent} _event - The form submit event (unused).
     * @param {HTMLElement} _target - The HTML element that triggered the action (unused).
     */
    static submitAction(_event, _target) {
        this._setConfirmed(true);
        this.close();
    }
}
