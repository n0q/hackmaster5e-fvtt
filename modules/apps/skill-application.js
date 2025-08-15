import { HMCONST, systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";
import { FormButtonManager } from "./foundation/components/form-button-manager.js";

/**
 * Skill check application.
 * @extends {HMApplication}
 */
export class SkillPrompt extends HMApplication {
    /** @inheritdoc */
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/skill-content-app.hbs"),
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
        return subject?.name
            ? `${subject.name}: ${game.i18n.localize("HM.skillcheck")}`
            : game.i18n.localize("HM.skillcheck");
    }

    /** @inheritdoc */
    async _preparePartContext(partId, context) {
        if (partId === "rollmode") context = this.prepareRollModeParts(context);
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
            disabled: false,
        }];

        return context;
    }

    prepareRollModeParts(context) {
        context.rollModes = CONFIG.Dice.rollModes;
        return context;
    }

    /** @inheritdoc */
    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);

        if (this._subject) {
            const { system } = this._subject;
            foundry.utils.mergeObject(context, {
                dc: HMCONST.SKILL.DIFF.AUTO,
                language: system.language,
                hasVerbal: system.bonus.total.verbal > 0,
                hasLiteracy: system.bonus.total.literacy > 0,
            });
        } else {
            context.dc = HMCONST.SKILL.DIFF.AUTO;
        }
    }

    /** @inheritdoc */
    async _onFirstRender(...args) {
        super._onFirstRender(...args);

        this.buttonManager = new FormButtonManager(this.element, [{
            name: "roll-submit",
            getLabel: formValues => this.getSubmitButtonLabel(formValues),
            isDisabled: () => false,
        }]);
    }

    /**
     * Callback to button manager to change button label.
     *
     * @param {Object} formValues
     * @returns {string}
     */
    getSubmitButtonLabel(formValues) {
        if (this._subject?.system?.language && formValues.formulaType) {
            if (formValues.formulaType === HMCONST.SKILL.TYPE.WRITTEN) {
                return game.i18n.localize("HM.literacy");
            }
            if (formValues.formulaType === HMCONST.SKILL.TYPE.VERBAL) {
                return game.i18n.localize("HM.language");
            }
        }
        return game.i18n.localize("HM.skillcheck");
    }

    /** @inheritdoc */
    _processFormData(_event, _form, formData) {
        const formObject = foundry.utils.expandObject(formData.object);

        return {
            dc: Number(formObject.dc),
            rollMode: formObject.rollMode,
            bonus: parseInt(formObject.bonus, 10) || 0,
            formulaType: formObject.formulaType || HMCONST.SKILL.TYPE.SKILL,
        };
    }

    /** @inheritdoc */
    async close(options) {
        this.buttonManager?.destroy();
        return super.close(options);
    }
}

