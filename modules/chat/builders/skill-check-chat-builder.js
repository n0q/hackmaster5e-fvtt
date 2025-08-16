import { ChatBuilder } from "../foundation/chat-builder-abstract.js";
import { getResult } from "../foundation/chat-builder-constants.js";
import { systemPath, HMCONST } from "../../tables/constants.js";

export const typeToRollFlavorMap = {
    [HMCONST.SKILL.TYPE.SKILL]: "Skill Check",
    [HMCONST.SKILL.TYPE.VERBAL]: "Verbal Check",
    [HMCONST.SKILL.TYPE.WRITTEN]: "Literacy Check",
};

export class SkillCheckChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-skill.hbs");

    async createChatMessage() {
        const { resp, roll } = this.data;

        const mdata = this.#enrichMdata();

        const resultData = this.#getResultData();
        const resultString = getResult(resultData);

        const chatData = { mdata, resp, resultString, roll };
        const content = await this.renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({ content, resp });
        await this.render(chatMessageData);
    }

    #enrichMdata() {
        const { mdata, resp, context } = this.data;

        mdata.specname = context.specname;
        mdata.mastery = context.system.mastery[resp.masteryType];
        mdata.level = context.system.bonus.total[resp.masteryType];
        mdata.isAuto = resp.dc === HMCONST.SKILL.DIFF.AUTO;

        const label = typeToRollFlavorMap[resp.masteryType];
        mdata.rollFlavor = `${context.specname} ${label}`;
        return mdata;
    }

    #getResultData() {
        const { mdata, resp } = this.data;
        const bestDc = mdata.bestDc;

        if (bestDc === null) {
            return this.RESULT_TYPE.FAILED;
        }

        if (resp.dc === HMCONST.SKILL.DIFF.AUTO) {
            const enumString = `SKILL${bestDc}`;
            return this.RESULT_TYPE[enumString];
        }

        if (resp.dc >= bestDc) {
            return this.RESULT_TYPE.PASSED;
        }

        return this.RESULT_TYPE.FAILED;
    }
}
