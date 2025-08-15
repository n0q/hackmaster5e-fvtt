/**
 * @deprecated
 */
import { HMCONST } from "../tables/constants.js";
import { AttackPrompt } from "../apps/legacy/attack.js";
import { CastPrompt } from "../apps/legacy/cast.js";
import { DamagePrompt } from "../apps/legacy/damage.js";
import { DefendPrompt } from "../apps/legacy/defend.js";

function getDialogData() {
    return {
        rollModes: CONFIG.Dice.rollModes,
        rollMode: game.settings.get("core", "rollMode"),
    };
}

function getWeapons(actor, itemId) {
    let weaponList = [];
    if (itemId) {
        weaponList.push(actor.wprofiles.get(itemId));
    } else {
        weaponList = actor.wprofiles.filter(a => HMCONST.ITEM_STATE.EQUIPPED <= a.system.state);
    }

    const weapons = weaponList.sort(
        (a, b) => a.system.state - b.system.state || a.name.localeCompare(b.name),
    );
    return { weapons };
}

function getSpells(actor, itemId) {
    if (itemId) return [actor.items.get(itemId)];
    return actor.items.filter(a => a.type === "spell");
}

function focusById(id) {
    return setTimeout(() => { document.getElementById(id).focus(); }, 50);
}

export class HMDialog {
    static async getAttackDialog(dataset, caller, opt) {
        const dialogResp = { caller };
        const dialogData = getWeapons(caller, dataset?.itemId);
        dialogData.caller = caller;
        if (opt.isCombatant) dialogData.inCombat = true;

        const title = `${caller.name}: ${game.i18n.localize("HM.dialog.getAttackTitle")}`;
        dialogResp.resp = await new Promise(resolve => {
            const options = { resolve, title };
            new AttackPrompt(dialogData, options).render(true);
        });

        dialogResp.context = dialogData.weapons[dialogResp.resp.widx];
        dialogResp.SPECIAL = HMCONST.SPECIAL;
        return dialogResp;
    }

    static async getCastDialog(dataset, caller, opt) {
        const dialogResp = { caller };
        const dialogData = getDialogData();

        dialogData.spells = getSpells(caller, dataset?.itemId);
        dialogData.caller = caller;
        if (opt.isCombatant) {
            dialogData.inCombat = true;
            dialogData.private = dataset.isNPC;
        }

        const title = game.i18n.localize("HM.dialog.getCastTitle");
        dialogResp.resp = await new Promise(resolve => {
            const options = { resolve, title };
            new CastPrompt(dialogData, options).render(true);
        });

        return dialogResp;
    }

    static async getDamageDialog(dataset, caller) {
        const dialogResp = { caller };
        const dialogData = getWeapons(caller, dataset?.itemId);
        dialogData.caller = caller;

        const title = `${caller.name}: ${game.i18n.localize("HM.dialog.getDamageTitle")}`;
        dialogResp.resp = await new Promise(resolve => {
            const options = { resolve, title };
            new DamagePrompt(dialogData, options).render(true);
        });

        dialogResp.context = dialogData.weapons[dialogResp.resp.widx];
        return dialogResp;
    }

    static async getDefendDialog(dataset, caller) {
        const dialogResp = { caller };
        const dialogData = getWeapons(caller, dataset?.itemId);
        dialogData.caller = caller;

        const title = `${caller.name}: ${game.i18n.localize("HM.dialog.getDefendTitle")}`;
        dialogResp.resp = await new Promise(resolve => {
            const options = { resolve, title };
            new DefendPrompt(dialogData, options).render(true);
        });

        dialogResp.context = dialogData.weapons[dialogResp.resp.widx];
        return dialogResp;
    }

    static async getSaveDialog(dataset, caller) {
        const dialogData = getDialogData();
        const dialogResp = { caller };

        const formulaTypeName = game.i18n.localize(`HM.saves.${dataset.formulaType}`);
        const title = `${formulaTypeName} ${game.i18n.localize("HM.dialog.getSaveTitle")}`;
        const template = "systems/hackmaster5e/templates/dialog/getSave.hbs";

        dialogResp.resp = await Dialog.wait({
            render: () => focusById("bonus"),
            title,
            content: await renderTemplate(template, dialogData),
            buttons: {
                save: {
                    label: game.i18n.localize("HM.dialog.getSaveTitle"),
                    callback: () => ({
                        bonus: parseInt(document.getElementById("bonus").value, 10) || 0,
                        rollMode: document.getElementById("rollMode").value,
                    }),
                },
            },
            default: "save",
        }, { width: 300 });

        dialogResp.context = caller;
        return dialogResp;
    }

    static async getAbilityDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = { caller };

        dialogData.ability = game.i18n.localize(`HM.ability.${dataset.ability}`);
        const title = `${caller.name}: ${dialogData.ability} ${game.i18n.localize("HM.roll")}`;
        const template = "systems/hackmaster5e/templates/dialog/getAbility.hbs";

        dialogResp.resp = await Dialog.wait({
            title,
            content: await renderTemplate(template, dialogData),
            render: () => focusById("mod"),
            buttons: {
                save: {
                    label: game.i18n.localize("HM.dialog.getAbilityButtonL"),
                    callback: () => ({
                        save: true,
                        mod: parseInt(document.getElementById("mod").value, 10) || 0,
                    }),
                },
                check: {
                    label: game.i18n.localize("HM.dialog.getAbilityButtonR"),
                    callback: () => ({
                        save: false,
                        mod: parseInt(document.getElementById("mod").value, 10) || 0,
                    }),
                },
            },
            default: "save",
        });

        dialogResp.context = caller;
        dialogResp.resp.oper = dialogResp.resp.save ? "+" : "-";
        return dialogResp;
    }
}
