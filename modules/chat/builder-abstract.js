import { BuilderSchema } from './builder-schema.js';

export const CBRESULT_TYPE = {
    NONE:       0,  // No special result.
    CRITFAIL:   1,
    FUMBLE:     2,
    PASSED:     3,
    FAILED:     4,
};

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
     * @param {Object} dataset.mdata - Details for chat card enrichment.
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

        const {roll} = this.data;
        if (obj.rolls ?? roll) {
            const rollData = {
                sound: CONFIG.sounds.dice,
            };

            if (!obj.rolls) rollData.rolls = Array.isArray(roll) ? roll : [roll];
            if (!obj.rollMode) rollData.rollMode = game.settings.get('core', 'rollMode');
            Object.assign(chatMessageData, rollData);
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
     * Returns HTML for a given CBRESULT_TYPE.
     *
     * @param {number} rv - Result value of type CBRESULT.TYPE.
     * @returns {string} HTML string for result type.
     */
    static getResult(rv) {
        if (!rv) return false;
        const type = CBRESULT_TYPE;

        if (rv === type.CRITFAIL) return '<b>Critical Failure</b>';
        if (rv === type.FUMBLE) return '<b>Fumble</b>';
        if (rv === type.PASSED) return '<b>Passed</b>';
        if (rv === type.FAILED) return '<b>Failed</b>';
        return `Unknown result type: <b>${rv}</b></span>`;
    }
}
