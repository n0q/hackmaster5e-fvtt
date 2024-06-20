import { ChatBuilder } from './chat-builder-abstract.js';

export class SaveCheckChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/chat-save.hbs';

    async createChatMessage() {
        console.warn(this.data);
        const {mdata, resp, roll} = this.data;

        const flavor = game.i18n.localize(`HM.CHAT.SAVE.${mdata.formulaType}`);
        const rollContent = await roll.render({flavor});

        const chatData = {rollContent, mdata, resp};
        const content = await renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({content, resp});
        await ChatMessage.create(chatMessageData);
    }
}
