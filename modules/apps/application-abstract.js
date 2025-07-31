const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Abstract base class for HackMaster applications using Handlebars templates.
 * @abstract
 * @extends {ApplicationV2}
 */
export class HMApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    /**
     * @param {...any} args - Arguments passed to the parent constructor.
     * @throws {Error} Throws if instantiated directly.
     */
    constructor(...args) {
        if (new.target === HMApplication) {
            throw new Error("HMApplication cannot be instantiated directly.");
        }
        super(...args);
    }

    /**
     * A static factory method to create, render, and await the result of an application.
     * @param {object} [options]       Application options.
     * @returns {Promise<object|null>} A promise that resolves with the application's
     *                                 result upon a confirmed close, or null if the
     *                                 application is closed without confirmation.
     * @static
     * @async
     */
    static async create(options) {
        const { promise, resolve } = Promise.withResolvers();
        const app = new this(options);
        app.addEventListener("close", () => resolve(app.isConfirmed ? app.result : null), { once: true });
        app.render({ force: true });
        return promise;
    }

    /**
     * Internal flag to track if the application was closed via a confirmation action.
     * @type {boolean}
     * @private
     */
    #isConfirmed = false;

    /**
     * A read-only flag indicating whether the application was closed via a confirmation action.
     * @returns {boolean}
     */
    get isConfirmed() {
        return this.#isConfirmed;
    }

    /**
     * Sets the confirmation state. Intended for use by child classes in their
     * action handlers before closing the application.
     * @param {boolean} [value=true] - The confirmation state to set.
     * @protected
     */
    _setConfirmed(value = true) {
        this.#isConfirmed = !!value;
    }

    /**
     * @type {object|null}
     * @private
     */
    #result = null;

    /**
     * @type {object|null}
     */
    get result() { return this.#result; }

    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["hackmaster2", "dialog", "standard-form"],
        form: {
            handler: HMApplication.#formHandler,
            submitOnClose: false,
            closeOnSubmit: false,
            submitOnChange: false,
        },
        position: {
            width: 450,
            height: "auto",
        },
    }

    /**
     * Submission handler.
     * @this {HMApplication}
     * @param {SubmitEvent} event
     * @param {HTMLFormElement} form
     * @param {FormDataExtended} formData
     */
    static #formHandler(event, form, formData) {
        this.#result = this._processFormData(event, form, formData);
    }

    /**
     * Perform processing of the submitted data. To prevent submission, throw an error.
     * @param {SubmitEvent} _event          The submit event (unused).
     * @param {HTMLFormElement} _form       The form element (unused).
     * @param {FormDataExtended} formData   The form data.
     * @returns {object}                    The data to return from this application.
     */
    _processFormData(_event, _form, formData) {
        return foundry.utils.expandObject(formData.object);
    }
}
