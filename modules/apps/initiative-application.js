import { systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";
import { FormButtonManager } from "./foundation/components/form-button-manager.js";
import { FormElementLinker } from "./foundation/components/form-element-linker.js";
import { getInitiativeFormula } from "../combat/initiative-utils.js";

/**
 * Initiative selection application.
 * @extends {HMApplication}
 */
export class InitiativePrompt extends HMApplication {
    /** @type {number|null} */
    #callback = {};

    /** @inheritdoc */
    static PARTS = {
        content: {
            template: systemPath("templates/dialog/initiative-content-app.hbs"),
        },
        control: {
            template: "templates/generic/form-footer.hbs",
            classes: ["dialog-buttons"],
        },
    };

    static #OVERRIDE_OPTIONS = {
        actions: { rollSubmit: HMApplication.submitAction },
        form: { submitOnChange: true },
        position: { width: 300 },
    };

    /** @inheritdoc */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        this.#OVERRIDE_OPTIONS,
        { inplace: false },
    );

    get title() {
        const name = this._subject.actor.name;
        return `${name}: ${game.i18n.localize("HM.dialog.getInitDieTitle")}`;

    }

    /** @inheritdoc */
    async _preparePartContext(partId, context) {
        if (partId === "control") context = this.prepareControlContext(context);
        return super._preparePartContext(partId, context);
    }

    /**
     * Prepare the control buttons context.
     */
    prepareControlContext(context) {
        context.buttons = [{
            type: "submit",
            icon: "fa-solid fa-dice-d20",
            name: "roll-submit",
            label: this.getButtonLabel(this.formValue),
            action: "rollSubmit",
        }];
        return context;
    }

    /** @inheritdoc */
    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);

        context.selectedDie = context.selectedDie || "1d12";
        context.modifier = context.modifier || 0;
    }

    /** @inheritdoc */
    async _onFirstRender(...args) {
        super._onFirstRender(...args);

        this.buttonManager = new FormButtonManager(this.element, [{
            name: "roll-submit",
            getLabel: formValue => this.getButtonLabel(formValue),
            isDisabled: () => false,
        }]);

        this.elementLinker = new FormElementLinker(this.element, [{
            source: "select[name='selectedDie']",
            target: "input[name='modifier']",
            sourceProperty: "value",
            targetProperty: "disabled",
            transform: value => value === "immediate",
        }]);

        this.#callback.updateCombat = Hooks.on("updateCombat", this._onUpdateCombat.bind(this));
        this.#callback.deleteCombat = Hooks.on("deleteCombat", this._onDeleteCombat.bind(this));
    }

    getEnrichedFormData(formValue = {}) {
        return {
            ...formValue,
            round: this._subject?.combat?.current?.round || 0,
            bonus: this._subject?.actor?.system?.bonus?.total?.init || 0,
            isImmediate: formValue.selectedDie === "immediate",
        };
    }

    /**
     * Callback to button manager to change button label.
     *
     * @param {Object} formValues
     * @returns {string}i
     */
    getButtonLabel(formValue) {
        const selectedDie = formValue?.selectedDie || "1d12";

        if (selectedDie === "immediate") {
            return game.i18n.localize("HM.immediate");
        }

        const enrichedData = this.getEnrichedFormData(formValue);
        const formula = getInitiativeFormula(enrichedData);
        return `Roll ${formula}`;
    }

    /** @inheritdoc */
    _processFormData(_event, _form, formData) {
        const formObject = foundry.utils.expandObject(formData.object);
        return this.getEnrichedFormData(formObject);
    }

    /**
     * Handle combat turn changes by re-rendering the control part.
     */
    _onUpdateCombat(combat, _changed, _options, _userId) {
        if (combat.id !== this._subject?.combat?.id) return;
        this.render({ parts: ["control"] });
    }

    _onDeleteCombat(combat, _options, _userId) {
        if (combat.id === this._subject.combat.id) {
            this.close();
        }
    }

    /** @inheritdoc */
    async close(options) {
        this.buttonManager?.destroy();
        this.elementLinker?.destroy();

        if (this.#callback.updateCombat !== null) {
            Hooks.off("updateCombat", this.#callback.updateCombat);
            this.#callback.updateCombat = null;
        }

        if (this.#callback.preDeleteCombatHook !== null) {
            Hooks.off("deleteCombat", this.#callback.preDeleteCombat);
            this.#callback.deleteCombat = null;
        }

        return super.close(options);
    }
}
