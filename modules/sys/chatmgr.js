import LOGGER from "../sys/logger.js";

export default class HMChatMgr {
    constructor(actor=null) {
        this._user = game.user.id;
        if (actor) { this._actor = actor; }
    }

    setActor(actor) { this._actor = actor; }

    async genCard(roll, dataset, itemData=null) {
        let cData;
        switch (dataset.rollType) {
            case "combat":
                cData = await this._createCombatCard(dataset, roll, itemData);
                break;
            case "skill":
                cData = await this._createSkillCard(itemData, roll);
                break;
            case "save":
                cData = await this._createSaveCard(dataset.saveType, roll);
                break;
            case "ability":
                cData = await this._createAbilityCard(dataset, roll);
                break;
        }

        const chatData = {
            roll: roll,
            rollMode: game.settings.get("core", "rollMode"),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            user: this._user,
            flavor: cData.flavor,
            content: cData.content,
            sound: CONFIG.sounds.dice
        };
        return chatData;
    }

    async _createCombatCard(data, roll, itemData) {
        const nameActor  = this._actor.name;
        const nameWeapon = itemData.name;
        const html = await roll.render();
        switch (data.rollCombat) {
            case "atk": {
                const sumDice = getDiceSum(roll);
                let specialRow = "<p>";
                if (sumDice >= 20) { specialRow += "<b>Critical!</b>";         } else
                if (sumDice == 19) { specialRow += "<b>Near Perfect!</b>";     } else
                if (sumDice == 1)  { specialRow += "<b>Potential Fumble!</b>"; }

                const title = nameActor + " attacks with " + nameWeapon;

                const speedRow = "Speed: " + itemData.data.stats.spd.derived.value;
                const card = speedRow + specialRow + html;
                return {flavor: title, content: card};
            }

            case "dmg": {
                const title = nameActor + " damages with " + nameWeapon;
                return {flavor: title, content: html};
            }

            case "def": {
                const sumDice = getDiceSum(roll);
                let specialRow = "<p>";
                if (sumDice >= 20) { specialRow += "<b>Perfect!</b>";            } else
                if (sumDice == 19) { specialRow += "<b>Near Perfect!</b>";       } else
                if (sumDice == 18) { specialRow += "<b>Superior!</b>";           } else
                if (sumDice == 1)  { specialRow += "<b>Free Second Attack!</b>"; }

                const title = nameActor + " defends with " + nameWeapon;
                const card  = specialRow + html;
                return {flavor: title, content: card};
            }
        }

        function getDiceSum(roll) {
            let sum = 0;
            for (let i = 0; i < roll.terms.length; i++) {
                for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
                    sum += roll.terms[i].results[j].result;
                }
            }
            return sum;
        }
    }

    async _createSkillCard(itemData, roll) {
        const html = await roll.render();
        return {flavor: itemData.name, content: html};
    }

    async _createSaveCard(dataType, roll) {
        const html = await roll.render();
        const savetype = game.i18n.localize("HM.saves." + dataType);
        const savename = game.i18n.localize("HM.save");
        return {flavor: savetype + " " + savename, content: html};
    }

    async _createAbilityCard(data, roll) {
        const html = await roll.render();
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
