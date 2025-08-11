import { systemPath } from "../tables/constants.js";
import { HMApplication } from "./foundation/application-abstract.js";
import { FormButtonManager } from "./foundation/components/form-button-manager.js";
import { FormElementLinker } from "./foundation/components/form-element-linker.js";
import { HMCombat } from "../combat/combat.js";

/**
 * Initiative selection application.
 * @extends {HMApplication}
 */
export class InitiativePrompt extends HMApplication {
    /** @type {number|null} */
    #combatTurnHook = null;

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
        position: { width: 400 },
        window: {
            title: "HM.dialog.getInitDieTitle",
        },
    };

    /** @inheritdoc */
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        this.#OVERRIDE_OPTIONS,
        { inplace: false },
    );

    /** @inheritdoc */
    async _preparePartContext(partId, context) {
        if (partId === "content") context = this.prepareContentContext(context);
        if (partId === "control") context = this.prepareControlParts(context);
        return super._preparePartContext(partId, context);
    }

    prepareContentContext(context) {
        const diceOptions = [
            { value: "immediate", label: game.i18n.localize("HM.immediate") },
            { value: "1d20", label: "d20" },
            { value: "1d12", label: "d12" },
            { value: "1d10", label: "d10" },
            { value: "1d8", label: "d8" },
            { value: "1d6", label: "d6" },
            { value: "1d4", label: "d4" },
            { value: "1d3", label: "d3" },
        ];

        context.diceOptions = diceOptions;
        context.combat = this._subject?.combat;
        context.actor = this._subject?.actor;

        return context;
    }

    prepareControlParts(context) {
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
        context.round = this._subject.combat.current.round;
        context.bonus = this._subject.actor.system.bonus.total.init;
        console.warn(context.bonus);
    }

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

        this.#combatTurnHook = Hooks.on("updateCombat", this._onUpdateCombat.bind(this));
    }

    /**
     * Get the label for the roll button based on current form state.
     * @param {object} formValue - Form data object from FormButtonManager.
     * @returns {string} The button label.
     */
    getButtonLabel(formValue) {
        const selectedDie = formValue?.selectedDie || "1d12";

        if (selectedDie === "immediate") {
            return game.i18n.localize("HM.immediate");
        }

        // Enrich formValue with round and bonus data like _processFormData does
        const enrichedFormValue = {
            ...formValue,
            round: this._subject.combat.current.round,
            bonus: this._subject.actor.system.bonus.total.init,
        };

        const formula = HMCombat.getInitiativeFormula(enrichedFormValue);
        return `Roll ${formula}`;
    }

    /** @inheritdoc */
    _processFormData(_event, _form, formData) {
        const formObject = foundry.utils.expandObject(formData.object);
        formObject.round = this._subject.combat.current.round;
        formObject.bonus = this._subject.actor.system.bonus.total.init;
        formObject.isImmediate = formObject.selectedDie === "immediate";
        return formObject;
    }

    /*
    _processFormData(event, form, formData) {
        const selectedDie = formData.get("selectedDie");
        const modifier = Number(formData.get("modifier")) || 0;
        return {
            die: selectedDie === "immediate" ? false : selectedDie,
            modifier,
            round: this._subject.combat.current.round,
        };
    }
*/

    /**
     * Handle combat turn changes by re-rendering the control part.
     *
     * @see Hook: updateCombat — Same parameters as {@link hookEvents.updateDocument}
     */
    _onUpdateCombat(combat, _changed, _options, _userId) {
        if (combat.id !== this._subject?.combat?.id) return;
        this.render({ parts: ["control"] });
    }

    /** @inheritdoc */
    async close(options) {
        this.buttonManager.destroy();
        this.elementLinker.destroy();

        if (this.#combatTurnHook !== null) {
            Hooks.off("combatTurnChange", this.#combatTurnHook);
            this.#combatTurnHook = null;
        }

        return super.close(options);
    }
}
