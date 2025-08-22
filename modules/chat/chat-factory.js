import { AbilityCheckChatBuilder } from "./builders/ability-check-chat-builder.js";
import { AlertNoteChatBuilder } from "./builders/alert-note-chat-builder.js";
import { AttackBuilder } from "./builders/attack-chat-builder.js";
import { SkillSurveyCheckChatBuilder } from "./builders/skill-survey-check-chat-builder.js";
import { CriticalChatBuilder } from "./builders/critical-chat-builder.js";
import { DamageChatBuilder } from "./builders/damage-chat-builder.js";
import { DefenseChatBuilder } from "./builders/defense-chat-builder.js";
import { FumbleChatBuilder } from "./builders/fumble-chat-builder.js";
import { InitNoteChatBuilder } from "./builders/initnote-chat-builder.js";
import { SaveCheckChatBuilder } from "./builders/save-check-chat-builder.js";
import { SkillCheckChatBuilder } from "./builders/skill-check-chat-builder.js";
import { SpellChatBuilder } from "./builders/spell-chat-builder.js";
import { TraumaCheckChatBuilder } from "./builders/trauma-check-chat-builder.js";

/**
 * Enumeration for chat factory types.
 *
 * @const
 * @enum {Symbol}
 */
export const CHAT_TYPE = {
    ABILITY_CHECK: Symbol("cftype_abil_check"),
    ALERT_NOTE: Symbol("cftype_alert_note"),
    ATTACK: Symbol("cftype_attack"),
    CRITICAL: Symbol("cftype_critical"),
    DAMAGE: Symbol("cftype_damage"),
    DEFENSE: Symbol("cftype_defense"),
    FUMBLE: Symbol("cftype_fumble"),
    INIT_NOTE: Symbol("cftype_init_note"),
    SAVE_CHECK: Symbol("cftype_save_check"),
    SKILL_CHECK: Symbol("cftype_skill_check"),
    SKILL_SURVEY_CHECK: Symbol("cftype_skill_survey_check"),
    SPELL: Symbol("cftype_spell"),
    TRAUMA_CHECK: Symbol("cftype_trauma_check"),
};

/**
 * Registry of available chat builder subclasses mapped to CHAT_TYPE entries.
 *
 * Used internally by HMChatFactory to resolve the correct builder class
 * at runtime based on the requested chat type.
 *
 * @constant
 * @type {Object<CHAT_TYPE, typeof ChatBuilder>}
 * @private
 */
const ChatBuilderRegistry = {
    [CHAT_TYPE.ABILITY_CHECK]: AbilityCheckChatBuilder,
    [CHAT_TYPE.ATTACK]: AttackBuilder,
    [CHAT_TYPE.ALERT_NOTE]: AlertNoteChatBuilder,
    [CHAT_TYPE.CRITICAL]: CriticalChatBuilder,
    [CHAT_TYPE.DAMAGE]: DamageChatBuilder,
    [CHAT_TYPE.DEFENSE]: DefenseChatBuilder,
    [CHAT_TYPE.FUMBLE]: FumbleChatBuilder,
    [CHAT_TYPE.INIT_NOTE]: InitNoteChatBuilder,
    [CHAT_TYPE.SAVE_CHECK]: SaveCheckChatBuilder,
    [CHAT_TYPE.SKILL_CHECK]: SkillCheckChatBuilder,
    [CHAT_TYPE.SKILL_SURVEY_CHECK]: SkillSurveyCheckChatBuilder,
    [CHAT_TYPE.SPELL]: SpellChatBuilder,
    [CHAT_TYPE.TRAUMA_CHECK]: TraumaCheckChatBuilder,
};

/**
 * Factory for creating and initializing ChatBuilder subclasses based on a given CHAT_TYPE.
 *
 * This factory handles dynamic resolution of builder classes using a predefined registry,
 * and returns fully-initialized instances via their static 'create()' method.
 *
 * Always use this to create chat builders instead of instantiating them manually.
 *
 * @class HMChatFactory
 */
export class HMChatFactory {
    /**
     * Prevents instantiation of this factoryt class.
     *
     * Using 'new HMChatFacotry()' is not supported and will throw an error.
     *
     * @throws {Error} Always throws to prevent direct instantiation.
     */
    constructor() {
        const msg = "'new HMChatFactory()' is unsupported. Use 'HMChatFactory.create(...)' instead.";
        throw new TypeError(msg);
    }

    /**
    * Asynchronously create and initialize a ChatBuilder for the given chat type.
    *
    * @static
    * @async
    * @param {CHAT_TYPE} type - The chat builder type to create, from the CHAT_TYPE enum.
    * @param {Object} dataset - The data needed for the builder's construction and hydration.
    * @param {Object} [options] - Extra options to pass during builder creation.
    * @returns {Promise<ChatBuilder>} A fully initialized instance of a ChatBuilder subclass.
    * @throws {Error} If the provided CHAT_TYPE does not match a registered builder.
    */
    static async create(type, dataset, options) {
        const BuilderClass = ChatBuilderRegistry[type];
        if (!BuilderClass) throw new Error(`Unknown type: ${type.toString()}.`);
        return BuilderClass.create(dataset, options);
    }
}
