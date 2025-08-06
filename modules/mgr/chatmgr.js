/**
 * @file Deprecated.
 * @deprecated Use chat/chat-factory.js instead.
 * Abandon all hope, ye who enter here.
 */
import { HMCONST } from "../tables/constants.js";

export class HMChatMgr {
    constructor() { this._user = game.user.id; }

    // This is out of control. We want: getCard(dataset, options)
    async getCard({ cardtype = HMCONST.CARD_TYPE.ROLL, roll, dataset, dialogResp = null, options }) {
        let cData;
        if (cardtype === HMCONST.CARD_TYPE.ROLL) {
            switch (dataset.dialog) {
                case "fumble":
                    cData = await createFumbleCard(dataset);
                    break;
                default:
            }
        }

        const chatData = {
            user: this._user,
            flavor: cData?.flavor || dialogResp?.caller?.name,
            content: cData.content,
            type: cData?.type || CONST.CHAT_MESSAGE_STYLES.OTHER,
            whisper: cData?.whisper,
        };

        if (!cData.squelch && (roll || dataset?.roll)) {
            chatData.rolls = Array.isArray(roll) ? roll : [cData?.roll || roll];
            chatData.rollMode = cData.rollMode ? cData.rollMode : game.settings.get("core", "rollMode");
            chatData.sound = CONFIG.sounds.dice;
        }

        return { ...chatData, ...options };
    }
}

async function createFumbleCard(dataset) {
    const { roll, resp } = dataset;

    const template = "systems/hackmaster5e/templates/chat/fumble.hbs";
    const resultContent = await renderTemplate(template, { resp });

    const typeStr = resp.type ? "HM.chatCard.rfumble" : "HM.chatCard.mfumble";
    let flavor = game.i18n.localize(typeStr);
    flavor += resp.innate ? ` (${game.i18n.localize("HM.innate")})` : "";
    let rollContent = await roll.render({ flavor });

    if (resp.comp) {
        const compFlavor = game.i18n.localize("HM.chatCard.comproll");
        rollContent += await resp.compRoll.render({ flavor: compFlavor });
    }

    const content = resultContent + rollContent;
    return { content, roll };
}
