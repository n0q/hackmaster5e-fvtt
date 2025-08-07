import { ChatBuilder } from "../foundation/chat-builder-abstract.js";
import { getResult } from "../foundation/chat-builder-constants.js";
import { systemPath } from "../../tables/constants.js";

export class AbilityCheckChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/check.hbs");

    async createChatMessage() {
        const { context, mdata, resp, roll } = this.data;

        const isCompeting = resp.oper === "+";

        const rolls = [roll];
        const rollFlavor = isCompeting ? "Competing Ability Check" : "Ability Check";
        const rollContent = await roll.render({ flavor: rollFlavor });

        let rv = false;
        const dieSum = ChatBuilder.getDiceSum(roll);

        if (isCompeting) {
            if (dieSum === 1) rv = this.RESULT_TYPE.CRITFAIL;
        }

        if (!isCompeting) {
            rv = roll.total < 1 ? this.RESULT_TYPE.PASSED : this.RESULT_TYPE.FAILED;
            if (dieSum > 19) rv = this.RESULT_TYPE.FUMBLE;
        }

        const resultString = getResult(rv);

        mdata.score = context.system.abilities.total[mdata.ability].value;
        const chatData = { rollContent, mdata, resultString };
        const content = await this.renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({ content, rolls });
        await this.render(chatMessageData);
    }
}
