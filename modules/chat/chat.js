import RollHandler from "../sys/roller.js";
import LOGGER from "../sys/logger.js";

export default class ChatHandler {

    static ChatDataSetup(content, title) {
        const newcontent = title + content;
        const chatData = {
            user: game.user.id,
            content: newcontent,
            sound: CONFIG.sounds.dice
        };
        return chatData;
    }
}
