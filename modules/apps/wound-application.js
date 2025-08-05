import { HMCONST, systemPath } from "../tables/constants.js";
import { HMApplication } from "./application-abstract.js";

/**
 * Wound application.
 * @extends {HMApplication}
 */
export class WoundPrompt extends HMApplication {
    /** @inheritdoc */
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/wound-content-app.hbs"),
            classes: ["flexrow"],
        },
        control: {
            template: "templates/generic/form-footer.hbs",
            classes: ["dialog-buttons"],
        },
    };

    get title() {
        const context = this.hmAppData?.context;
        return context
            ? `${context.name}: ${game.i18n.localize("HM.dialog.setWoundTitle")}`
            : `${game.i18n.localize("HM.dialog.setWoundTitle")}`;
    }

    static #OVERRIDE_OPTIONS = {
        actions: { rollSubmit: HMApplication.submitAction },
        form: { submitOnChange: true },
        position: { width: 350 },
    }

    _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);

        const formBlock = this.element;
        const checkbox = formBlock.querySelector("input[name='isEmbedded']");
        const select = formBlock.querySelector("select[name='embed']");
        select.disabled = !checkbox.checked;
    }

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
            label: "Inflict Injury",
            action: "rollSubmit",
        }];
        return context;
    }

    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);
        context.embed = HMCONST.RANGED.EMBED.AUTO;
    }
}
