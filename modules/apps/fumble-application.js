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
        const formData = new FormData(this.form);

        context.buttons = [{
            type: "submit",
            icon: "fa-solid fa-dice-d20",
            name: "roll-submit",
            action: "rollSubmit",
            label: this.getSubmitButtonLabel(formData),
            disabled: this.isSubmitButtonDisabled(formData),
        }];

        return context;
    }

    async _onFirstRender(...args) {
        super._onFirstRender(...args);

        this.buttonManager = new FormButtonManager(this.element, [{
            name: "roll-submit",
            getLabel: formData => this.getSubmitButtonLabel(formData),
            isDisabled: formData => this.isSubmitButtonDisabled(formData),
        }]);

    }

    /**
     * @param {FormData} formData
     * @returns {string}
     */
    getSubmitButtonLabel(formData) {
        const formula = calculateFumbleFormula(formData);
        return formula ? `Roll ${formula}` : "Roll d1000";
    }

    /**
     * @param {FormData} formData
     * @returns {boolean}
     */
    isSubmitButtonDisabled(formData) {
        const atk = formData.atk ?? 0;
        const def = formData.def ?? 0;
        return (atk - def) >= 0;
    }

    async close(options) {
        this.buttonManager.destroy();
        super.close(options);
    }
}
