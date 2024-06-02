import { ChatBuilder } from './builder-abstract.js';
import { InitNoteBuilder } from './initnote-builder.js';

/**
 * Enumeration for chat factory types.
 * @enum {number}
 */
export const CFTYPE = {
    INIT_NOTE:  0,  // Initiative updates.
};

/**
 * Handler for creating instances of chat builders based on the specified type.
 * @param {Object} _ - The target object being constructed (ChatBuilder). Ignored.
 * @param {CFTYPE} args.0 - The CFTYPE enum value representing the type of chat builder to create.
 * @param {...*} args.1 - Additional arguments passed to the constructor of the chat builder.
 * @returns {ChatBuilder} An instance of a chat builder based on the provided type.
 */
const handler = {
    construct(_, args) {
        const [type, ...bArgs] = args;
        if (type === CFTYPE.INIT_NOTE) return new InitNoteBuilder(...bArgs);
        throw new Error(`Unknown type: ${type}.`);
    },
};

export const HMChatFactory = new Proxy(ChatBuilder, handler);