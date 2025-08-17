import { HMCONST, systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";
import { getChanceOfSuccess } from "../rules/processors/skill-processor.js";
import { FormButtonManager } from "./foundation/components/form-button-manager.js";

const getLabelType = type => {
    return {
        [HMCONST.SKILL.TYPE.SKILL]: "Skill Check",
        [HMCONST.SKILL.TYPE.VERBAL]: "Verbal Check",
        [HMCONST.SKILL.TYPE.WRITTEN]: "Literacy Check",
    }[type];
};

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
        const actorName = this._subject.actor.name;
        const skillName = this._subject.skill.specname;
        const masteryType = this._subject.masteryType;
        const label = getLabelType(masteryType).toLowerCase();

        return `${actorName}: ${skillName} ${label}`;
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

        foundry.utils.mergeObject(context, {
            dc: HMCONST.SKILL.DIFF.AUTO,
            masteryType: this._subject.masteryType,
            rollMode: game.settings.get("core", "rollMode"),
        });
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
        const labelKey = getLabelType(this._subject.masteryType);
        const localizedLabel = game.i18n.localize(labelKey);

        if (Number(formValues.dc) === HMCONST.SKILL.DIFF.AUTO) {
            return localizedLabel;
        }

        const { masteryType } = this._subject;
        const mastery = this._subject.skill.system.bonus.total[masteryType];
        const pSuccess = getChanceOfSuccess({ mastery, ...formValues });

        return `${localizedLabel} (${pSuccess}%)`;
    }

    /** @inheritdoc */
    _processFormData(_event, _form, formData) {
        const formObject = foundry.utils.expandObject(formData.object);

        return {
            dc: Number(formObject.dc),
            rollMode: formObject.rollMode,
            bonus: parseInt(formObject.bonus, 10) || 0,
            masteryType: this._subject.masteryType,
        };
    }

    /** @inheritdoc */
    async close(options) {
        this.buttonManager?.destroy();
        return super.close(options);
    }
}

