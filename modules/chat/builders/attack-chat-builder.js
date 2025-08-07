import { ChatBuilder } from "../foundation/chat-builder-abstract.js";
import {
    getResult,
    getCombatModifierFlavor,
    getDeclarativeFlavor,
} from "../foundation/chat-builder-constants.js";
import { systemPath, HMCONST } from "../../tables/constants.js";

export class AttackBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-attack.hbs");

    async createChatMessage() {
        const { context, resp, roll } = this.data;

        const mdata = this.#generateMetaData(context, resp);

        const chatData = { context, mdata };

        if (mdata.isDeclarative) {
            mdata.declarativeFlavor = getDeclarativeFlavor(resp);
        } else {
            const combatModFlavor = getCombatModifierFlavor(resp);
            const flavor = this.#getRollFlavor(mdata.isRanged, combatModFlavor);

            const result = this._getDiceResult(roll);
            chatData.resultString = getResult(result);
            chatData.rollContent = await roll.render({ flavor });

            if (result === this.RESULT_TYPE.CRITICAL) mdata.resultClass = "hm-shake";
        }

        const content = await this.renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({ content, resp });
        await this.render(chatMessageData);
    }

    /**
     * Generates a flavor text to use with an attack roll, based on
     * combat mods and if the attack is ranged or not.
     *
     * @param {boolean} isRanged
     * @param {string} combatModFlavor
     * @returns {string}
     */
    #getRollFlavor(isRanged, combatModFlavor) {
        const formatData = {
            attackType: isRanged ? "Ranged" : "Melee",
            combatMods: combatModFlavor ? ` (${combatModFlavor})` : "",
        };
        return game.i18n.format("HM.CHAT.atk", formatData);
    }

    /**
     * Generates metadata for the attack roll template.
     *
     * @param {Object} context
     * @param {Object} resp
     * @returns {Object}
     */
    #generateMetaData(context, resp) {
        return {
            isRanged: context.system.ranged.checked,
            reach: resp.reach,
            isDeclarative: resp?.button === "declare",
            specialMove: resp?.specialMove,
            hasJab: context.system.jab.checked,
            isJab: resp?.specialMove === HMCONST.SPECIAL.JAB,
            isSetForCharge: resp?.specialMove === HMCONST.SPECIAL.SET4CHARGE,
        };
    }

    /**
     * Flags special dice roll outcomes.
     *
     * @param {Roll} roll
     * @returns {symbol}
     */
    _getDiceResult(roll) {
        const diceSum = ChatBuilder.getDiceSum(roll);
        if (diceSum >= 20) return this.RESULT_TYPE.CRITICAL;
        if (diceSum === 19) return this.RESULT_TYPE.NEAR_PERFECT;
        if (diceSum === 1) return this.RESULT_TYPE.POT_FUMBLE;
    }
}
