import { systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";
import { FormButtonManager } from "./foundation/components/form-button-manager.js";
import { calculateFumbleFormula } from "../rules/processors/fumble-processor.js";

/**
 * Fumble application.
 * @extends {HMApplication}
 */
export class FumblePrompt extends HMApplication {
    /** @inheritdoc */
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/fumble-content-app.hbs"),
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
        position: { width: 400 },
    };

    /** @inheritdoc */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        this.#OVERRIDE_OPTIONS,
        { inplace: false },
    );

    get title() {
        const subject = this._subject;
        return subject
            ? `${subject.name}: ${game.i18n.localize("HM.dialog.getFumbleTitle")}`
            : game.i18n.localize("HM.dialog.getFumbleTitle");
    }

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
     * @returns {string}
     */
    getSubmitButtonLabel(formValues) {
        const formula = calculateFumbleFormula(formValues);
        return formula ? `Roll ${formula}` : "Roll d1000";
    }

    /**
     * Callback to button manager to control button state.
     *
     * @param {Object} formValues
     * @returns {boolean}
     */
    isSubmitButtonDisabled(formValues) {
        const atk = formValues.atk ?? 0;
        const def = formValues.def ?? 0;
        return (atk - def) >= 0;
    }

    async close(options) {
        this.buttonManager.destroy();
        super.close(options);
    }
}
