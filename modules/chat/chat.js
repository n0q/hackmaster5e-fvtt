import LOGGER from "../sys/logger.js";

export default class ChatHandler {
    constructor(actor) {
        this._user = game.user.id;
        this._actor = actor;
    }

    async genCard(roll, dataset, itemData=null) {
        const html = await roll.render();
        let cData;
        switch (dataset.rollType) {
            case "combat":
                cData = this._createCombatCard(dataset, html, itemData);
                break;
            case "skill":
                cData = this._createSkillCard(itemData, html);
                break;
            case "save":
                cData = this._createSaveCard(dataset.saveType, html);
                break;
            case "ability":
                cData = this._createAbilityCard(dataset, html);
                break;
        }

        const chatData = {
            roll: roll,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            user: this._user,
            flavor: cData.flavor,
            content: cData.content,
            sound: CONFIG.sounds.dice
        };
        return chatData;
    }

    _createCombatCard(data, html, itemData) {
        const nameActor  = this._actor.name;
        const nameWeapon = itemData.name;
        switch (data.rollCombat) {
            case "atk": {
                const speedWeapon = itemData.data.spd.derived.value;
                const title = nameActor + " attacks with " + nameWeapon;
                const card = "Speed: " + speedWeapon + "<p>" + html;
                return {flavor: title, content: card};
            }

            case "dmg": {
                const title = nameActor + " damages with " + nameWeapon;
                return {flavor: title, content: html};
            }

            case "def": {
                const title = nameActor + " defends with " + nameWeapon;
                return {flavor: title, content: html};
            }
        }
    }

    _createSkillCard(itemData, html) {
        return {flavor: itemData.name, content: html};
    }

    _createSaveCard(dataType, html) {
        const savetype = game.i18n.localize("HM.saves." + dataType);
        const savename = game.i18n.localize("HM.save");
        return {flavor: savetype + " " + savename, content: html};
    }

    _createAbilityCard(data, html) {
        const title = this._actor.name + " rolls " + data.ability;
        return {flavor: title, content: html};
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
