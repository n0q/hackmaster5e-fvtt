import LOGGER from "../sys/logger.js";
import { HMTABLES } from "../sys/constants.js";

export default class HMChatMgr {
    constructor() { this._user = game.user.id }

    async getCard(roll, dataset, dialogResp=null) {
        let cData;
        switch (dataset.dialog) {
            case "atk":
            case "ratk":
            case "def":
            case "dmg":
                cData = await this._createWeaponCard(roll, dataset, dialogResp);
                break;
            case "skill":
                cData = await this._createSkillCard(roll, dialogResp);
                break;
            case "save":
                cData = await this._createSaveCard(roll, dataset);
                break;
            case "ability":
                cData = await this._createAbilityCard(roll, dataset, dialogResp);
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

    async _createWeaponCard(roll, dataset, dialogResp) {
        const actor = dialogResp.caller;
        const item = dialogResp.context;

        const html = await roll.render();
        switch (dataset.dialog) {
            case "ratk": {
                const sumDice = getDiceSum(roll);
                let specialRow = "<p>";
                if (sumDice >= 20) { specialRow += "<b>Critical!</b>";         } else
                if (sumDice == 19) { specialRow += "<b>Near Perfect!</b>";     } else
                if (sumDice == 1)  { specialRow += "<b>Potential Fumble!</b>"; }

                const title = actor.name + " attacks with a " + item.name + ".";

                const speedRow = "Speed: " + item.data.data.stats.spd.derived.value;
                const rangeRow = "<br>" + game.i18n.localize("HM." + dialogResp.resp.rangestr)
                               + " Range";
                const card = speedRow + rangeRow + specialRow + html;
                return {flavor: title, content: card};
            }
            case "atk": {
                const sumDice = getDiceSum(roll);
                let specialRow = "<p>";
                if (sumDice >= 20) { specialRow += "<b>Critical!</b>";         } else
                if (sumDice == 19) { specialRow += "<b>Near Perfect!</b>";     } else
                if (sumDice == 1)  { specialRow += "<b>Potential Fumble!</b>"; }

                const title = actor.name + " attacks with a " + item.name + ".";

                const speedRow = "Speed: " + item.data.data.stats.spd.derived.value;
                const card = speedRow + specialRow + html;
                return {flavor: title, content: card};
            }

            case "dmg": {
                const shield = dialogResp.resp.shieldhit ? " shield-" : " ";
                const title = actor.name + shield + "hits with a " + item.name + ".";
                return {flavor: title, content: html};
            }

            case "def": {
                const sumDice = getDiceSum(roll);
                let specialRow = "<p>";
                if (sumDice >= 20) { specialRow += "<b>Perfect!</b>";            } else
                if (sumDice == 19) { specialRow += "<b>Near Perfect!</b>";       } else
                if (sumDice == 18) { specialRow += "<b>Superior!</b>";           } else
                if (sumDice == 1)  { specialRow += "<b>Free Second Attack!</b>"; }

                const title = actor.name + " defends with a " + item.name + ".";

                const fa_shield = '<i class="fas fa-shield-alt"></i>';
                const actordr = actor.data.data.derived.armor.dr;
                const drRow   = "DR: " + actordr.value + " + " + fa_shield + actordr.shield.value;
                const card  = drRow + specialRow + html;
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

    async _createSkillCard(roll, dialogResp) {
        const item = dialogResp.context;
        const itemData = item.data.data;
        const html = await roll.render();
        let content = html;

        let flavor = item.name;
        if (itemData.specialty.checked && itemData.specialty.value) {
            flavor += ' (' + itemData.specialty.value + ')';
        }
        if (dialogResp.resp.opposed) flavor += ' (Opposed)';
        else {
            const difficulty = HMTABLES.skill.difficulty;
            for (let key in difficulty) {
                if (roll.total + difficulty[key] > 0) continue;
                const diffRow = game.i18n.localize(key) + ' ' + game.i18n.localize('HM.skillcheck');
                content = diffRow + '<p>' + html;
                break;
            }
        }
        return {flavor, content};
    }

    async _createSaveCard(roll, dataset) {
        const html = await roll.render();
        const savetype = game.i18n.localize("HM.saves." + dataset.formulaType);
        const savename = game.i18n.localize("HM.save");
        return {flavor: savetype + " " + savename, content: html};
    }

    async _createAbilityCard(roll, dataset, dialogResp) {
        const content = await roll.render();
        const rolltype = dialogResp.resp.save
            ? game.i18n.localize("HM.save")
            : game.i18n.localize("HM.check");
        const flavor = dialogResp.context.name + ": " + dataset.ability + " " + rolltype;
        return {flavor, content};
    }
}
