import { BuilderSchema } from './builder-schema.js';

/**
 * Chat card builder.
 * @class
 * @abstract
 */
export class ChatBuilder {
    /**
     * Creates an instance of ChatBuilder.
     * @constructor
     * @throws {Error} - If instantiated directly.
     * @param {Object} dataset - The dataset object for the builder.
     * @param {HMActor} dataset.caller - The actor the chat pertains to.
     * @param {HMItem} dataset.context - The item the chat pertains to.
     * @param {Roll} dataset.roll - A dice roll the chat pertains to.
     * @param {Object} dataset.resp - Data polled from the user from an Application.
     * @param {Object[]} dataset.batch - Bulk object data for batch processing.
     * @param {Object} dataset.options - Options passed directly to ChatMessage.create().
     */
    constructor(dataset, options) {
        if (new.target === ChatBuilder) {
            throw new Error('ChatBuilder cannot be instantiated directly.');
        }
        this.data = new BuilderSchema({...dataset, options});
    }

    /**
     * Returns a chatMessageData object for creating a chat message.
     * @param {Object} obj - An object containing data for the ChatMessage.
     */
    getChatMessageData(obj) {
        const chatMessageData = {
            user: game.user.id,
            flavor: obj.flavor,
            content: obj.content,
            type: obj.type || CONST.CHAT_MESSAGE_TYPES.OTHER,
            whisper: obj.whisper,
        };

        if (this.data.roll) {
            const rollData = {
                rolls: [this.data.roll],
                rollMode: obj.rollMode ?? game.settings.get('core', 'rollMode'),
                type: CONST.CHAT_MESSAGES_TYPES.ROLL,
                sound: CONFIG.sounds.dice,
            };
            return {...chatMessageData, ...rollData};
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
     * @static
     * @return {string[]} List of GM ids on the game.
     */
    static getGMs() {
        return game.users.reduce((arr, u) => {
            if (u.isGM) arr.push(u.id);
            return arr;
        }, []);
    }
}
