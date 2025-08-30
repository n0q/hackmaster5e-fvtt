import { systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";

export class SavesPrompt extends HMApplication {
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/saves-content-app.hbs"),
        },
        rollmode: {
            template: systemPath("templates/dialog/parts/getRollMode2.hbs"),
        },
        control: {
            template: "templates/generic/form-footer.hbs",
            classes: ["dialog-buttons"],
        },
    };

    static #OVERRIDE_OPTIONS = {
        actions: { rollSubmit: HMApplication.submitAction },
        form: { submitOnChange: false },
        position: { width: 350 },
    };

    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        this.#OVERRIDE_OPTIONS,
        { inplace: false },
    );

    get title() {
        const actorName = this._subject?.caller?.name || "";
        const formulaTypeName = this._subject?.formulaTypeName || "";
        const saveText = game.i18n.localize("HM.dialog.getSaveTitle");
        return `${actorName}: ${formulaTypeName} ${saveText}`;
    }

    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);

        context.rollModes = CONFIG.Dice.rollModes;
        context.rollMode = game.settings.get("core", "rollMode");

        foundry.utils.mergeObject(context, {
            bonus: 0,
            rollMode: context.rollMode,
        }, { overwrite: false });
    }

    async _preparePartContext(partId, context) {
        if (partId === "control") {
            const formulaTypeName = this._subject?.formulaTypeName || "";
            const saveText = game.i18n.localize("HM.dialog.getSaveTitle");
            const buttonLabel = `${formulaTypeName} ${saveText}`;

            context.buttons = [{
                type: "submit",
                icon: "fa-solid fa-shield-halved",
                name: "roll-submit",
                action: "rollSubmit",
                label: buttonLabel,
            }];
        }
        return super._preparePartContext(partId, context);
    }

    async _processFormData(event, form, formData) {
        const data = super._processFormData(event, form, formData);

        return {
            bonus: parseInt(data.bonus, 10) || 0,
            rollMode: data.rollMode || game.settings.get("core", "rollMode"),
        };
    }
}
