import { ChatBuilder } from './chat-builder-abstract.js';

export class AbilityCheckChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/check.hbs';

    async createChatMessage() {
        const {context, mdata, resp, roll} = this.data;

        const isCompeting = resp.oper === '+';

        const rolls = [roll];
        const rollFlavor = isCompeting ? 'Competing Ability Check' : 'Ability Check';
        const rollContent = await roll.render({flavor: rollFlavor});

        let rv = false;
        const dieSum = ChatBuilder.getDiceSum(roll);

        if (isCompeting) {
            if (dieSum === 1) rv = this.RESULT_TYPE.CRITFAIL;
        }

        if (!isCompeting) {
            rv = roll.total < 1 ? this.RESULT_TYPE.PASSED : this.RESULT_TYPE.FAILED;
            if (dieSum > 19) rv = this.RESULT_TYPE.FUMBLE;
        }

        const resultString = ChatBuilder.getResult(rv);

        mdata.score = context.system.abilities.total[mdata.ability].value;
        const chatData = {rollContent, mdata, resultString};
        const content = await ChatBuilder.handlebars.renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({content, rolls});
        await ChatMessage.create(chatMessageData);
    }
}
