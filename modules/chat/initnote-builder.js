import { ChatBuilder } from './builder-abstract.js';

export class InitNoteBuilder extends ChatBuilder {
    constructor(...args) {
        super(...args);
        this.template = 'systems/hackmaster5e/templates/chat/initNote.hbs';
    }

    /**
     * @param {string} name - Combatant name.
     * @param {boolean} hidden - If this receipt should be hidden.
     * @param {number} delta - Difference between oldInit and newInit.
     * @param {number} oldInit
     * @param {number} newInit
     */
    async createChatMessage() {
        const {batch} = this.data;
        const hiddenCombatants = Object.groupBy(batch, (c) => c.hidden);

        Object.keys(hiddenCombatants).map(async (foo) => {
            const sortByName = (a, b) => a.name.localeCompare(b.name);
            const sortedContext = hiddenCombatants[foo].sort(sortByName);
            const content = await renderTemplate(this.template, sortedContext);
            const whisper = foo === 'true' ? ChatBuilder.getGMs() : undefined;

            const chatMessageData = this.getChatMessageData({content, whisper});
            await ChatMessage.create(chatMessageData);
        });
    }
}
