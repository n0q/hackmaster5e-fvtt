import { ChatBuilder } from './chat-builder-abstract.js';
import { AbilityCheckChatBuilder } from './ability-check-chat-builder.js';
import { AlertNoteChatBuilder } from './alert-note-chat-builder.js';
import { CriticalChatBuilder } from './critical-chat-builder.js';
import { DefenseChatBuilder } from './defense-chat-builder.js';
import { InitNoteChatBuilder } from './initnote-chat-builder.js';
import { SaveCheckChatBuilder } from './save-check-chat-builder.js';
import { SkillCheckChatBuilder } from './skill-check-chat-builder.js';
import { SpellChatBuilder } from './spell-chat-builder.js';
import { TraumaCheckChatBuilder } from './trauma-check-chat-builder.js';

/**
 * Enumeration for chat factory types.
 * @enum {Symbol}
 */
export const CHAT_TYPE = Object.freeze({
    ABILITY_CHECK: Symbol('cftype_abil_check'),
    ALERT_NOTE: Symbol('cftype_alert_note'),
    CRITICAL: Symbol('cftype_critical'),
    DEFENSE: Symbol('cftype_defense'),
    INIT_NOTE: Symbol('cftype_init_note'),
    SAVE_CHECK: Symbol('cftype_save_check'),
    SKILL_CHECK: Symbol('cftype_skill_check'),
    SPELL: Symbol('cftype_spell'),
    TRAUMA_CHECK: Symbol('cftype_trauma_check'),
});

/**
 * Handler for creating instances of chat builders based on the specified type.
 * @param {Object} _ - The target object being constructed (ChatBuilder). Ignored.
 * @param {CHAT_TYPE} args.0 - The CHAT_TYPE enum value representing the type of builder to create.
 * @param {...*} args.1 - Additional arguments passed to the constructor of the chat builder.
 * @returns {ChatBuilder} An instance of a chat builder based on the provided type.
 */
const handler = {
    construct(_, args) {
        const [type, ...bArgs] = args;
        if (type === CHAT_TYPE.ABILITY_CHECK) return new AbilityCheckChatBuilder(...bArgs);
        if (type === CHAT_TYPE.ALERT_NOTE) return new AlertNoteChatBuilder(...bArgs);
        if (type === CHAT_TYPE.CRITICAL) return new CriticalChatBuilder(...bArgs);
        if (type === CHAT_TYPE.DEFENSE) return new DefenseChatBuilder(...bArgs);
        if (type === CHAT_TYPE.INIT_NOTE) return new InitNoteChatBuilder(...bArgs);
        if (type === CHAT_TYPE.SAVE_CHECK) return new SaveCheckChatBuilder(...bArgs);
        if (type === CHAT_TYPE.SKILL_CHECK) return new SkillCheckChatBuilder(...bArgs);
        if (type === CHAT_TYPE.SPELL) return new SpellChatBuilder(...bArgs);
        if (type === CHAT_TYPE.TRAUMA_CHECK) return new TraumaCheckChatBuilder(...bArgs);
        throw new Error(`Unknown type: ${type}.`);
    },
};

export const HMChatFactory = new Proxy(ChatBuilder, handler);
