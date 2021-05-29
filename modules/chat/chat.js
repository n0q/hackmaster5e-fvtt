import RollHandler from "../sys/roller.js";
import LOGGER from "../sys/logger.js";

export default class ChatHandler {
    constructor() {
        this._user = game.user.id;
    }

    genCard(html, actor, dataset, itemData=null) {
        var title;
        switch (dataset.rollType) {
            case "combat":
                title = this._createCombatCard(dataset.rollCombat, actor, itemData);
                break;
            case "skill":
                title = this._createSkillCard(itemData);
                break;
            case "save":
                title = this._createSaveCard(dataset.saveType);
                break;
        }

        var content = title + html;
        const chatData = {
            user: this._user,
            content: content,
            sound: CONFIG.sounds.dice
        };
        return chatData;
    }

    _createCombatCard(combatType, actor, itemData) {
        var title;
        var nameActor  = actor.name;
        var nameWeapon = itemData.name;
        switch (combatType) {
            case "atk": {
                let speedWeapon = itemData.data.spd.derived.value;
                title = nameActor + " attacks with " + nameWeapon +
                        ".<p>"    + "Speed: " + speedWeapon;
                break;
            }

            case "dmg": {
                title = nameActor + " damages with " + nameWeapon;
                break;
            }

            case "def": {
                title = nameActor + " defends with " + nameWeapon;
                break;
            }
        }
        return title;
    }

    _createSkillCard(itemData) {
        return itemData.name;
    }

    _createSaveCard(dataType) {
        let savetype = game.i18n.localize("HM.saves." + dataType);
        let savename = game.i18n.localize("HM.save");
        return savetype + " " + savename;
    }

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
