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
        const hiddenCombatants = Object.groupBy(batch, c => c.hidden);

        await Promise.all(
            Object.keys(hiddenCombatants).map(async combatant => {
                const sortByName = (a, b) => a.name.localeCompare(b.name);
                const sortedContext = hiddenCombatants[combatant].sort(sortByName);
                const content = await this.renderTemplate(this.template, sortedContext);

                const isHidden = combatant === "true";
                const chatData = { content };

                if (isHidden) {
                    chatData.rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
                }

                const chatMessageData = this.getChatMessageData(chatData);
                await this.render(chatMessageData);
            }),
        );
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
