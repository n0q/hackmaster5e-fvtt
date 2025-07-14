import { BuilderSchema } from './chat-builder-schema.js';

/**
 * Enumeration for chat result codes.
 * @enum {Symbol}
 */
const RESULT_TYPE = {
    NONE: Symbol('result_none'),
    CRITFAIL: Symbol('result_critfail'),
    DCRITFAIL: Symbol('result_dcritfail'),
    FAILED: Symbol('result_failed'),
    FUMBLE: Symbol('result_fumble'),
    GOODBYE: Symbol('result_goodbye'),
    NEAR_PERFECT: Symbol('result_near_perfect'),
    PASSED: Symbol('result_passed'),
    PERFECT: Symbol('result_perfect'),
    SKILL4: Symbol('result_skill_trivial'),
    SKILL3: Symbol('result_skill_easy'),
    SKILL2: Symbol('result_skill_avg'),
    SKILL1: Symbol('result_skill_diff'),
    SKILL0: Symbol('result_skill_vdiff'),
    SUPERIOR: Symbol('result_superior'),
};

/**
 * Chat card builder.
 * @class
 * @abstract
 */
export class ChatBuilder {
    /**
     * Internal schema wrapper for normalizing input data.
     * @type {BuilderSchema}
     * @private
     */
    #schema;

    /**
     * Base ChatBuilder constructor (abstract).
     *
     * Stores dataset and options in normalized form using BuilderSchema.
     * Each subclass must define a static 'template' property.
     * Use the static 'create()' method instead of calling 'new' directly.
     *
     * @abstract
     * @constructor
     * @todo Implement an 'init' method to support async uuid resolution.
     * @throws {Error} - If instantiated directly.
     * @param {Object} dataset - The dataset object for the builder.
     * @param {Object} dataset.caller - Uuid for the actor the chat pertains to.
     * @param {Object} dataset.context - Uuid for the item the chat pertains to.
     * @param {Object} dataset.roll - Json data for a dice roll the chat pertains to.
     * @param {Object} dataset.resp - Data polled from the user from an Application.
     * @param {Object[]} dataset.batch - Bulk object data for batch processing.
     * @param {Object} dataset.mdata - Details for chat card enrichment.
     * @param {Object} dataset.options - Options passed directly to ChatMessage.create().
     * @prop {string} template - Path to hbs template. Must be defined by subclasses.
     * @throws {Error} If instantiated directly or if 'template' is undefined in subclass.
     */
    constructor(dataset, options) {
        if (new.target === ChatBuilder) {
            throw new Error('ChatBuilder cannot be instantiated directly. Use Class.create() instead.');
        }

        if (!new.target.template) {
            throw new Error('Subclasses must define a static template property.');
        }

        this.template = new.target.template;
        this.RESULT_TYPE = RESULT_TYPE;
        this.#schema = new BuilderSchema({ ...dataset, options });
    }

    /**
     * Creates and initializes an instance of a ChatBuilder subclass.
     *
     * Use this method, instead of 'new'.
     *
     * @async
     * @static
     * @param {Object} dataset - The dataset to initialize the builder with.
     * @param {Object} [options] - Options passed directoy to ChatMessage.create()
     * @returns {Promise<ChatBuilder>} A fully initialized ChatBuilder instance.
     */
    static async create(dataset, options) {
        const instance = new this(dataset, options);
        return instance.init();
    }

    /**
     * Populates instance data post-construction.
     *
     * Hydreates resolved actor/item references from UUIDs, parses roll and batch data.
     * Prepares the builder's internal 'data' structure for chat rendering.
     *
     * Automatically called from 'create()' and should not be called manually.
     *
     * @async
     * @returns {Promise<this>} Initialized ChatBuilder instance.
     */
    async init() {
        const schema = this.#schema;
        this.data = {
            caller: schema.caller ? await foundry.utils.fromUuid(schema.caller) : null,
            context: schema.context ? await foundry.utils.fromUuid(schema.context) : null,
            roll: schema.roll ? Roll.fromData(schema.roll) : null,
            resp: schema.resp ?? {},
            mdata: schema.mdata ?? {},
            batch: this._prepareBatchData(schema.batch),
            options: schema.options ?? {},
        };
        return this;
    }

    /**
     * Parses bulk roll data from dataset.
     *
     * Subclasses can override this method to customize batch handling.
     *
     * @protected
     * @param {Object[]} batchData - Array of raw roll data.
     * @returns {Roll[]} Array of parsed Roll instances.
     */
    /* eslint-disable-next-line class-methods-use-this */
    _prepareBatchData(batchData) {
        if (!batchData) return [];
        if (!Array.isArray(batchData)) return [];
        return batchData.map((data) => Roll.fromData(data));
    }

    /**
     * A shortcut to Foundry's handlebars template system.
     *
     * @returns {typeof foundry.applications.handlebars}
     */
    static get handlebars() {
        return foundry.applications.handlebars;
    }

    /**
     * Updates this.data with new information after builder instantiation.
     * @param {string} key - this.data key to update.
     * @param {Object} value - An object containing data to merge into this.data[key].
     */
    update(key, value) {
        this.data[key] ??= {};
        foundry.utils.mergeObject(this.data[key], value);
    }

    /**
     * Mapping of result types to their corresponding HTML representations.
     * @type {Object.<Symbol, string|undefined>}
     * @private
     */
    static #resultCache;

    /**
     * Initializes #resultCache with the mapping of result types to their corresponding HTML.
     * Called only once when the cache isn't created yet.
     * @return {Object.<Symbol, string|undefined} - The initialized result mapping object.
     * @private
     * @static
     */
    static #initializeResultCache() {
        this.#resultCache = {
            [RESULT_TYPE.NONE]: undefined,
            [RESULT_TYPE.CRITFAIL]: `<b>${game.i18n.localize('HM.CHAT.RESULT.critfail')}</b>`,
            [RESULT_TYPE.DCRITFAIL]: `<b>${game.i18n.localize('HM.CHAT.RESULT.dcritfail')}</b>`,
            [RESULT_TYPE.FAILED]: `<b>${game.i18n.localize('HM.CHAT.RESULT.failed')}</b>`,
            [RESULT_TYPE.FUMBLE]: `<b>${game.i18n.localize('HM.CHAT.RESULT.fumble')}</b>`,
            [RESULT_TYPE.GOODBYE]: `<b>${game.i18n.localize('HM.CHAT.RESULT.goodbye')}</b>`,
            [RESULT_TYPE.NEAR_PERFECT]: `<b>${game.i18n.localize('HM.CHAT.RESULT.nperfect')}</b>`,
            [RESULT_TYPE.PASSED]: `<b>${game.i18n.localize('HM.CHAT.RESULT.passed')}</b>`,
            [RESULT_TYPE.PERFECT]: `<b>${game.i18n.localize('HM.CHAT.RESULT.perfect')}</b>`,
            [RESULT_TYPE.SKILL4]: `<b>${game.i18n.localize('HM.CHAT.RESULT.skill4')}</b>`,
            [RESULT_TYPE.SKILL3]: `<b>${game.i18n.localize('HM.CHAT.RESULT.skill3')}</b>`,
            [RESULT_TYPE.SKILL2]: `<b>${game.i18n.localize('HM.CHAT.RESULT.skill2')}</b>`,
            [RESULT_TYPE.SKILL1]: `<b>${game.i18n.localize('HM.CHAT.RESULT.skill1')}</b>`,
            [RESULT_TYPE.SKILL0]: `<b>${game.i18n.localize('HM.CHAT.RESULT.skill0')}</b>`,
            [RESULT_TYPE.SUPERIOR]: `<b>${game.i18n.localize('HM.CHAT.RESULT.superior')}</b>`,
        };
        return this.#resultCache;
    }

    /**
     * Returns a chatMessageData object for creating a chat message.
     * @param {Object} obj - An object containing data for the ChatMessage.
     * @param {string[]} obj.rolls - An array of roll.render(). Supercedes data.roll if present.
     * @param {string} obj.flavor - Chat flavor text. Supercedes this.data.caller.name if present.
     */
    getChatMessageData(obj) {
        const chatMessageData = {
            ...obj,
            user: game.user.id,
            type: obj.type ?? CONST.CHAT_MESSAGE_STYLES.OTHER,
        };

        const hasFlavor = Object.prototype.hasOwnProperty.call(chatMessageData, 'flavor');
        if (!hasFlavor) chatMessageData.flavor = this.data.caller?.name;

        const { roll } = this.data;
        if (obj.rolls ?? roll) {
            const rollData = {
                sound: CONFIG.sounds.dice,
            };

            if (!obj.rolls) rollData.rolls = Array.isArray(roll) ? roll : [roll];
            Object.assign(chatMessageData, rollData);

            const rollMode = obj.rollMode
                ?? obj.resp?.rollMode
                ?? game.settings.get('core', 'rollMode');
            ChatMessage.applyRollMode(chatMessageData, rollMode);
        }
        return chatMessageData;
    }

    /**
     * Abstract method to generate chat message.
     * @abstract
     * @throws {Error} if unimplemented.
     */
    async createChatMessage() {
        const className = this.constructor.name;
        throw new Error(`${className}.createChatMessage() is unimplemented.`);
    }

    /**
     * Generates a message to send to chat.
     * Contents of this.data.options overrides chatMessageData, if present.
     * @async
     * @param {Object} chatMessageData - object to pass to ChatMessage.create()
     */
    async render(chatMessageData) {
        const obj = { ...chatMessageData, ...this.data.options };
        await ChatMessage.create(obj);
    }

    /**
     * @static
     * @return {string[]} List of GM ids on the game.
     */
    static get getGMs() {
        return game.users.filter((u) => u.isGM).map((u) => u.id);
    }

    /**
     * Extracts the sum of the dice rolled from a Roll object,
     * ignoring any constants or other terms.
     * @param {Roll} roll - The Roll object containing the dice and other terms.
     * @returns {number} The sum of the dice rolled.
     */
    static getDiceSum(roll) {
        let sum = 0;
        for (let i = 0; i < roll.terms.length; i++) {
            for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
                sum += roll.terms[i].results[j].result;
            }
        }
        return sum;
    }

    /**
     * Returns HTML for a given RESULT_TYPE.
     *
     * @param {Symbol} rv - Result symbol of type RESULT_TYPE.
     * @returns {string} HTML string for result type.
     */
    static getResult(rv) {
        if (!rv || rv === RESULT_TYPE.NONE) return false;
        this.#resultCache ||= this.#initializeResultCache();
        return this.#resultCache[rv] || `Unknown result type: <b>${rv}</b>`;
    }
}
