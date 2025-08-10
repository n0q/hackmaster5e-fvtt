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
            label: this.getButtonLabel(),
            action: "rollSubmit",
            disabled: this.isButtonDisabled(),
        }];

        return context;
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
        const formula = calculateFumbleFormula(result || {});
        return formula ? `Roll ${formula}` : "Roll d1000";
    }

    isButtonDisabled(override = {}) {
        const result = { ...this.result, ...override };
        const atk = result.atk ?? 0;
        const def = result.def ?? 0;
        return (atk - def) >= 0;
    }
}
