import { systemPath } from "../../tables/constants.js";
import { ChatBuilder } from "../foundation/chat-builder-abstract.js";

export class InitNoteChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/initNote.hbs");

    /**
     * @typedef {Object} initData
     * @prop {string} name - Combatant name.
     * @prop {boolean} hidden - If this receipt should be hidden.
     * @prop {number} delta - Difference between oldInit and newInit.
     * @prop {number} oldInit - The initial init value.
     * @prop {number} newInit - The updated init value.
     */

    /**
     * @param {initData[]} batch
     */
    async createChatMessage() {
        const { batch } = this.data;

        const hasHiddenCombatants = batch.some(c => c.hidden);
        const isPrivateChat = game.settings.get("core", "rollMode") !== CONST.DICE_ROLL_MODES.PUBLIC;
        const cssClass = isPrivateChat || hasHiddenCombatants ? "whisper" : undefined;

        const sortByName = (a, b) => a.name.localeCompare(b.name);

        const chatData = {
            combatants: batch.sort(sortByName),
            cssClass,
        };

        const content = await this.renderTemplate(this.template, chatData);

        const chatMessageDataConfig = { content };

        if (hasHiddenCombatants) {
            chatMessageDataConfig.rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
        }

        const chatMessageData = this.getChatMessageData(chatMessageDataConfig);
        await this.render(chatMessageData);
    }

    /**
     * @override
     * @param {initData[]} batchData
     * @returns {initData[]}
     */
    _prepareBatchData(batchData) {
        if (!batchData) return [];
        return batchData;
    }
}
