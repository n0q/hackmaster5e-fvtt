const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Abstract base class for HackMaster applications using Handlebars templates.
 * @abstract
 * @extends {ApplicationV2}
 *
 * @typedef  {Object} HMAppData
 * @property {Object} [defaults] - initial data to prepopulate the form.
 * @property {Object} [subject] - Supplimentary data for enrichment.
 */
export class HMApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    /** @type {function} Stores _onInputChange callback. */
    #inputListener = null;

    /** @type {HMAppData} */
    #hmAppData = null;

    /**
     * @param {...any} args - Arguments passed to the parent constructor.
     * @param {HMAppData} - Data to send to the application.
     * @throws {Error} Throws if instantiated directly.
     */
    constructor(options = {}, { defaults, subject } = {}) {
        if (new.target === HMApplication) {
            throw new Error("HMApplication cannot be instantiated directly.");
        }

        super(options);
        this.#hmAppData = { defaults, subject };
    }

    /**
     * A static factory method to create, render, and await the result of an application.
     * @param {object} [options={}]    Application configuration options.
     * @param {HMAppData} [data={}]    defaults data passed to the constructor.
     * @returns {Promise<object|null>} A promise that resolves with the application's
     *                                 result upon a confirmed close, or null if the
     *                                 application is closed without confirmation.
     * @static
     * @async
     */
    static async create(options = {}, { defaults, subject } = {}) {
        const { promise, resolve } = Promise.withResolvers();
        const app = new this(options, { defaults, subject });
        app.addEventListener("close", () => resolve(app.isConfirmed ? app.result : undefined), { once: true });
        app.render({ force: true });
        return promise;
    }


    /**
     * @returns {object|*} Supplimentary form data. Typically a object, but you do you, boo.
     */
    get _subject() {
        return this.#hmAppData.subject;
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

    /**
     * Handles the submit action by marking the action as confirmed
     * and closing the associated component or dialog.
     *
     * @param {SubmitEvent} _event - The form submit event (unused).
     * @param {HTMLElement} _target - The HTML element that triggered the action (unused).
     */
    static submitAction(_event, _target) {
        this._setConfirmed(true);
        this.close();
    }

    async _preFirstRender(context, options) {
        super._preFirstRender(context, options);
        if (this.#hmAppData.defaults) {
            foundry.utils.mergeObject(context, this.#hmAppData.defaults);
        }
    }

    /**
     * Attaches event listeners to the Application frame.
     *
     * @override
     * Extends the base implementation by adding a listener for input changes
     * on <input>, <select>, and <textarea> elements within the form.
     *
     * @param {...*} args - Forarded arguments.
     */
    _attachFrameListeners(...args) {
        super._attachFrameListeners(...args);

        const form = this.form;

        if (form) {
            this.#inputListener = event => {
                if (event.target.matches("input, select, textarea")) {
                    this._onInputChange(event);
                }
            };
            form.addEventListener("input", this.#inputListener);
        }
    }

    /** @inheritdoc */
    async close(options) {
        if (this.form && this.#inputListener) {
            this.form.removeEventListener("input", this.#inputListener);
            this.#inputListener = null;
        }

        return super.close(options);
    }

    /**
     * Handles changes to form input elements.
     * Subclasses may override this method to handle input state changes.
     *
     * @param {Event} _event - Input event object.
     */
    _onInputChange(_event) {
        // intentionally empty.
    }
}
