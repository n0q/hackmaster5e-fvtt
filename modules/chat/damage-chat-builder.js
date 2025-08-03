import { ChatBuilder } from "./chat-builder-abstract.js";
import { systemPath, SYSTEM_ID } from "../tables/constants.js";
import { calculateArmorDamage } from "../sys/utils.js";
import { getCombatModifierFlavor } from "./chat-constants.js";

export class DamageChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-damage.hbs");

    /** @type {boolean} True if we're using armor degredation rules. */
    #useArmorDegredation;

    constructor(...args) {
        super(...args);
        this.#useArmorDegredation = game.settings.get(SYSTEM_ID, "armorDegredation");
    }

    async createChatMessage() {
        const { caller, context, resp, roll } = this.data;

        let flavor = context.system.ranged.checked
            ? game.i18n.localize("HM.CHAT.rdmg")
            : game.i18n.localize("HM.CHAT.mdmg");

        const combatModFlavor = getCombatModifierFlavor(resp);
        if (combatModFlavor) flavor += ` (${combatModFlavor})`;
        const rollContent = await roll.render({ flavor });

        const mdata = {
            specialMove: resp.specialMove,
            armorDamage: this.#useArmorDegredation ? calculateArmorDamage(roll) : 0,
        };

        /** @todo This belongs in rollDamage. */
        this.#triggerArmorDamageHook(caller, mdata.armorDamage);

        const chatData = { context, caller, mdata, rollContent };
        const content = await this.renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({ content, resp });
        await ChatMessage.create(chatMessageData);
    }

    /**
     * Triggers the armorDamage hook if conditions are met.
     * @param {HMActor} caller - The actor inflicting damage.
     * @param {number} armorDamage - The amount of armor damage.
     */
    #triggerArmorDamageHook(caller, armorDamage) {
        const isBeast = caller.type === "beast";
        if (armorDamage > 0 && isBeast) {
            Hooks.callAll("armorDamage", armorDamage, game.user.id);
        }
    }
}
