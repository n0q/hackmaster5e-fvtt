import { ChatBuilder } from './chat-builder-abstract.js';

export class InitNoteChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/initNote.hbs';

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
        const hiddenCombatants = Object.groupBy(batch, (c) => c.hidden);

        await Promise.all(
            Object.keys(hiddenCombatants).map(async (foo) => {
                const sortByName = (a, b) => a.name.localeCompare(b.name);
                const sortedContext = hiddenCombatants[foo].sort(sortByName);
                const content = await renderTemplate(this.template, sortedContext);
                const whisper = foo === 'true' ? ChatBuilder.getGMs() : undefined;

                const chatMessageData = this.getChatMessageData({ content, whisper });
                await ChatMessage.create(chatMessageData);
            }),
        );
    }

    /**
     * @override
     * @param {initData[]} batchData
     * @returns {initData[]}
     */
    /* eslint-disable-next-line class-methods-use-this */
    _prepareBatchData(batchData) {
        if (!batchData) return [];
        return batchData;
    }
}
