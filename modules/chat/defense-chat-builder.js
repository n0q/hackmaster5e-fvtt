import { ChatBuilder } from "./chat-builder-abstract.js";
import { getResult } from "./chat-constants.js";
import { systemPath, HMCONST } from "../tables/constants.js";

/**
 * DefenseChatBuilder handles defense-related chat messages.
 *
 * @extends ChatBuilder
 */
export class DefenseChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-defend.hbs");

    async createChatMessage() {
        const { caller, context, resp, roll } = this.data;
        const mdata = { dr: caller.drObj };

        const sumDice = ChatBuilder.getDiceSum(roll);
        const result = getDiceResult.call(this, sumDice);
        const resultString = getResult(result);

        const flavor = game.i18n.localize("HM.CHAT.def") + getRollFlavor(resp);
        const rollContent = await roll.render({ flavor });

        const chatData = { context, mdata, resultString, rollContent };
        const content = await this.renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({ content, resp });
        await ChatMessage.create(chatMessageData);
    }
}

/**
 * Determines the result category based on the sum of dice rolled.
 *
 * @this ChatBuilder
 * @param {number} sumDice - The total of all dice rolled.
 * @returns {symbol} A result type from `RESULT_TYPE`.
 */
function getDiceResult(sumDice) {
    if (sumDice >= 20) return this.RESULT_TYPE.PERFECT;
    if (sumDice === 19) return this.RESULT_TYPE.NEAR_PERFECT;
    if (sumDice === 18) return this.RESULT_TYPE.SUPERIOR;
    if (sumDice === 1) return this.RESULT_TYPE.FUMBLE;
    return this.RESULT_TYPE.NONE;
}

/**
 * BUilds a flavor text string for the roll based on special movement types
 * and dodge status.
 *
 * @param {object} resp - The response data associated with the roll.
 * @param {symbol} [resp.specialMove] - The special move code, if any.
 * @param {boolean} [resp.dodge] - If the character dodged.
 * @returns {string} A localized string indicating special effects or modifiers.
 */
function getRollFlavor(resp) {
    const mods = [];
    const { specialMove } = resp;
    const { SPECIAL } = HMCONST;
    if (specialMove === SPECIAL.FLEEING) mods.push(game.i18n.localize("HM.fleeing"));
    if (specialMove === SPECIAL.GGROUND) mods.push(game.i18n.localize("EFFECT.gground"));
    if (specialMove === SPECIAL.RDEFEND) mods.push(game.i18n.localize("HM.ranged"));
    if (specialMove === SPECIAL.SCAMPER) mods.push(game.i18n.localize("EFFECT.scamper"));
    if (specialMove === SPECIAL.SET4CHARGE) mods.push(game.i18n.localize("HM.specSelect.s4c"));
    if (resp.dodge) mods.push(game.i18n.localize("HM.dodged"));
    return mods.length ? ` (${mods.join(", ")})` : "";
}
