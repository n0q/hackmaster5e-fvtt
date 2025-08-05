import { systemPath } from "../../tables/constants.js";
import { ChatBuilder } from "../foundation/chat-builder-abstract.js";

const ALERT_TYPE = {
    TRAUMA: Symbol("alert_type_trauma"),
    TENACITY: Symbol("alert_type_tenacity"),
};

export class AlertNoteChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-alert.hbs");

    constructor(...args) {
        super(...args);
        this.ALERT_TYPE = ALERT_TYPE;
    }

    async createChatMessage() {
        const { type } = this.data.mdata;
        const mdata = {
            flavor: "HM.CHAT.ALERT.TRAUMA.flavor",
            text: "HM.CHAT.ALERT.TRAUMA.text",
        };

        if (type === this.ALERT_TYPE.TENACITY) {
            mdata.flavor = "HM.CHAT.ALERT.TENACITY.flavor";
            mdata.text = "HM.CHAT.ALERT.TENACITY.text";
        }

        const chatData = { mdata };
        const content = await this.renderTemplate(this.template, chatData);
        const chatMessageData = this.getChatMessageData({ content });
        await this.render(chatMessageData);
    }
}
