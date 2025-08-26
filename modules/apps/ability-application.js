import { systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";

export class AbilityPrompt extends HMApplication {
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/ability-content-app.hbs"),
        },
        control: {
            template: "templates/generic/form-footer.hbs",
            classes: ["dialog-buttons"],
        },
    };

    static #OVERRIDE_OPTIONS = {
        actions: {
            saveSubmit: HMApplication.submitAction,
            checkSubmit: HMApplication.submitAction,
        },
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
        const abilityName = this._subject?.ability || "";
        const rollText = game.i18n.localize("HM.roll");
        return `${actorName}: ${abilityName} ${rollText}`;
    }

    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);
        context.ability = this._subject?.ability || "";
    }

    async _preparePartContext(partId, context) {
        if (partId === "control") {
            context.buttons = [
                {
                    type: "submit",
                    icon: "fa-solid fa-shield-halved",
                    name: "save-submit",
                    action: "saveSubmit",
                    label: game.i18n.localize("HM.dialog.getAbilityButtonL"),
                },
                {
                    type: "submit",
                    icon: "fa-solid fa-dice-d20",
                    name: "check-submit",
                    action: "checkSubmit",
                    label: game.i18n.localize("HM.dialog.getAbilityButtonR"),
                },
            ];
        }
        return super._preparePartContext(partId, context);
    }

    async _processFormData(event, form, formData) {
        const data = super._processFormData(event, form, formData);
        const isSave = event.submitter?.name === "save-submit";

        return {
            save: isSave,
            mod: parseInt(data.mod, 10) || 0,
            oper: isSave ? "+" : "-",
        };
    }
}

