import { ChatBuilder } from "../foundation/chat-builder-abstract.js";
import { systemPath } from "../../tables/constants.js";

export class FumbleChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/fumble.hbs");

    async createChatMessage() {
        const { batch, resp, mdata } = this.data;

        foundry.utils.mergeObject(mdata, this.#generateMetaData(batch, mdata, resp));

        const formatData = {
            type: game.i18n.localize(resp.isRanged ? "HM.ranged" : "HM.melee"),
            innate: resp.isInnate ? game.i18n.localize("HM.innate") : "",
        };

        const rollFlavor = [
            game.i18n.format("HM.chatCard.fumble", formatData),
            game.i18n.localize("HM.chatCard.comproll"),
        ];

        resp.atk = resp.atk ?? 0;

        const rollResults = await Promise.all(
            batch.map((roll, i) => roll.render({ flavor: rollFlavor[i] }))
        );
        const rollContent = rollResults.join("");

        const chatData = { rollContent, mdata, resp };
        const content = await this.renderTemplate(this.template, chatData);
        const chatMessageData = this.getChatMessageData(({ content }));
        await this.render(chatMessageData);
    }

    #generateMetaData(batch, mdata, resp) {
        const type = Number(resp.isRanged);

        return {
            freeAttack: !!(batch[0].total % 2),
            hasComplication: !!mdata.complication,
            resultString: `HM.FUMBLE.type.${type}.${mdata.typeIdx}`,
            injuryString: `HM.FUMBLE.injury.${mdata.complication}`,
            labelString: `HM.FUMBLE.label.${type}.${mdata.rollIdx}`,
            compString: `HM.FUMBLE.comp.${mdata.complication}`,
        };
    }
}
