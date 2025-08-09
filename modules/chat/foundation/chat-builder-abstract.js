import { BuilderSchema } from "./chat-builder-schema.js";
import { getSpeaker } from "../../sys/utils.js";
import { RESULT_TYPE } from "./chat-builder-constants.js";

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
            throw new Error("ChatBuilder cannot be instantiated directly. Use Class.create() instead.");
        }

        if (!new.target.template) {
            throw new Error("Subclasses must define a static template property.");
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
        return batchData.map(data => Roll.fromData(data));
    }

    /**
     * A shortcut to Foundry's handlebars template system.
     *
     * @returns {function(string, object=): Promise<string>}
     */
    get renderTemplate() {
        return foundry.applications.handlebars.renderTemplate;
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
     * Returns a chatMessageData object for creating a chat message.
     * @param {Object} obj - An object containing data for the ChatMessage.
     * @param {string[]} obj.rolls - An array of roll.render(). Supercedes data.roll if present.
     * @param {string} obj.flavor - Chat flavor text. Supercedes this.data.caller.name if present.
     */
    getChatMessageData(obj) {
        const { options, resp, roll } = this.data;

        const chatMessageData = {
            ...obj,
            user: game.user.id,
            type: obj.type ?? CONST.CHAT_MESSAGE_STYLES.OTHER,
        };

        const hasFlavor = Object.prototype.hasOwnProperty.call(chatMessageData, "flavor");
        if (!hasFlavor) chatMessageData.flavor = this.data.caller?.name;

        const rollMode = obj.rollMode
            ?? obj.resp?.rollMode
            ?? resp?.rollMode
            ?? options?.rollMode
            ?? game.settings.get("core", "rollMode");

        if (obj.rolls ?? roll) {
            const rollData = {
                sound: CONFIG.sounds.dice,
            };

            if (!obj.rolls) rollData.rolls = Array.isArray(roll) ? roll : [roll];
            Object.assign(chatMessageData, rollData);
        }

        ChatMessage.applyRollMode(chatMessageData, rollMode);
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
        const speaker = getSpeaker(this.data?.caller);
        const obj = { ...chatMessageData, speaker, ...this.data.options };
        await ChatMessage.create(obj);
    }

    /**
     * @static
     * @return {string[]} List of GM ids on the game.
     */
    static get getGMs() {
        return game.users.filter(u => u.isGM).map(u => u.id);
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
}
