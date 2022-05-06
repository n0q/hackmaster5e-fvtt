import { HMCONST } from '../sys/constants.js';
import { AttackPrompt } from '../apps/attack.js';
import { DamagePrompt } from '../apps/damage.js';
import { SkillPrompt } from '../apps/skill.js';

function getDialogData() {
    return {
        rollModes: CONFIG.Dice.rollModes,
        rollMode: game.settings.get('core', 'rollMode'),
    };
}

function getWeapons(actor, itemId) {
    let weaponList = [];
    if (itemId) {
        weaponList.push(actor.items.get(itemId));
    } else {
        weaponList = actor.items.filter(
            (a) => a.type === 'weapon'
            && HMCONST.ITEM_STATE.EQUIPPED <= a.data.data.state,
        );
    }

    function wsort(a, b) {
        return a.name > b.name || a.data.data.state > b.data.data.state ? 1 : -1;
    }

    const weapons = weaponList.sort(wsort);
    return {weapons};
}

async function getAttackDialog(dataset, caller, opt) {
    const dialogResp = {caller};
    const dialogData = getWeapons(caller, dataset?.itemId);
    if (opt.isCombatant) dialogData.inCombat = true;

    const title = `${caller.name}: ${game.i18n.localize('HM.dialog.getAttackTitle')}`;
    dialogResp.resp = await new Promise((resolve) => {
        const options = {resolve, title};
        new AttackPrompt(dialogData, options).render(true);
    });

    dialogResp.context = dialogData.weapons[dialogResp.resp.widx];
    return dialogResp;
}

async function getDamageDialog(dataset, caller) {
    const dialogResp = {caller};
    const dialogData = getWeapons(caller, dataset?.itemId);

    const title = `${caller.name}: ${game.i18n.localize('HM.dialog.getDamageTitle')}`;
    dialogResp.resp = await new Promise((resolve) => {
        const options = {resolve, title};
        new DamagePrompt(dialogData, options).render(true);
    });

    dialogResp.context = dialogData.weapons[dialogResp.resp.widx];
    return dialogResp;
}

async function getSkillDialog(dataset, caller) {
    const dialogResp = {caller};
    const dialogData = getDialogData();
    dialogData.skill = caller.items.get(dataset.itemId);

    const titlePre = dataset.callers > 1 ? `${dataset.callers}` : `${caller.name}:`;
    const titlePost = dataset.callers > 1
        ? game.i18n.localize('HM.dialog.getSkillTitle2')
        : game.i18n.localize('HM.dialog.getSkillTitle1');
    const title = `${titlePre} ${game.i18n.localize(dialogData.skill.name)} ${titlePost}`;
    dialogResp.resp = await new Promise((resolve) => {
        const options = {resolve, title};
        new SkillPrompt(dialogData, options).render(true);
    });
    dialogResp.context = dialogData.skill;
    return dialogResp;
}

export class HMDialogMgr {
    getDialog(dataset, caller=null, opt={}) {
        const name = dataset.dialog;
        if (name === 'ability') return this.getAbilityDialog(dataset, caller);
        if (name === 'atk')     return      getAttackDialog(dataset, caller, opt);
        if (name === 'cast')    return this.getCastDialog(dataset, caller);
        if (name === 'ratk')    return      getAttackDialog(dataset, caller);
        if (name === 'def')     return this.getDefendDialog(dataset, caller);
        if (name === 'dmg')     return      getDamageDialog(dataset, caller);
        if (name === 'initdie') return this.getInitDieDialog(caller);
        if (name === 'save')    return this.getSaveDialog(dataset, caller);
        if (name === 'skill')   return      getSkillDialog(dataset, caller);
        if (name === 'wound')   return this.setWoundDialog(caller);
        return undefined;
    }

    _focusById(id) {
        return setTimeout(() => { document.getElementById(id).focus(); }, 50);
    }

    getSpells(actor, itemId) {
        if (itemId) return [actor.items.get(itemId)];
        return actor.items.filter((a) => a.type === 'spell');
    }

    async getInitDieDialog(caller) {
        const dialogData = getDialogData();
        const dialogResp = {caller};

        const template = 'systems/hackmaster5e/templates/dialog/getInitDie.hbs';
        dialogResp.resp = await new Promise(async (resolve) => {
            new Dialog({
                title: game.i18n.localize('HM.dialog.getInitDieTitle'),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    getdie: {
                        label: 'Roll',
                        callback: () => {
                            resolve({
                                'die': document.getElementById('choices').value,
                            });
                        },
                    },
                    start: {
                        label: 'Set to One',
                        callback: () => {
                            resolve({
                                'die': false,
                            });
                        },
                    },
                },
                default: 'getdie',
            }, {width: 400}).render(true);
        });
        return dialogResp;
    }

    async setWoundDialog(caller) {
        const dialogResp = {caller};
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize('HM.dialog.setWoundTitle'),
                content: await renderTemplate('systems/hackmaster5e/templates/dialog/setWound.hbs'),
                buttons: {
                    wound: {
                        label: game.i18n.localize('HM.dialog.setWoundTitle'),
                        callback: () => {
                            resolve({
                                'value': parseInt(document.getElementById('hp').value || 0)
                            })
                        }
                    }
                },
                default: 'wound'
            }, {width: 175}).render(true);
            this._focusById('hp');
        });
        const resp = dialogResp.resp.value;
        dialogResp.data = {hp: resp, timer: resp};
        return dialogResp;
    }

    async getSaveDialog(dataset, caller) {
        const dialogData = getDialogData();
        const dialogResp = {caller};

        const template = 'systems/hackmaster5e/templates/dialog/getSave.hbs';
        dialogResp.resp = await new Promise(async (resolve) => {
            new Dialog({
                title: game.i18n.localize('HM.dialog.getSaveTitle'),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    save: {
                        label: game.i18n.localize('HM.dialog.getSaveTitle'),
                        callback: () => {
                            resolve({
                                'bonus': parseInt(document.getElementById('bonus').value || 0, 10),
                                'rollMode': document.getElementById('rollMode').value,
                            });
                        },
                    },
                },
                default: 'save',
            }).render(true);
            this._focusById('bonus');
        });
        dialogResp.context = caller;
        return dialogResp;
    }

    async getCastDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.spells = this.getSpells(caller, dataset?.itemId);
        dialogData.divine = dataset.itemDivine === 'true' ? true : false;
        const template = 'systems/hackmaster5e/templates/dialog/getCast.hbs';

        let sidx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize('HM.dialog.getCastTitle'),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    cast: {
                        label: game.i18n.localize('HM.cast'),
                        icon: '<i class="fas fa-magic"></i>',
                        callback: (html) => {
                            sidx = html.find('#spell-select')[0].value;
                            resolve({
                                'mod': parseInt(document.getElementById('mod').value || 0, 10),
                            })
                        }
                    }
                },
                default: 'cast'
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.spells[sidx];
        return dialogResp;
    }

    async getDefendDialog(dataset, caller) {
        const dialogResp = {caller};
        const dialogData = getWeapons(caller, dataset?.itemId);
        const template = 'systems/hackmaster5e/templates/dialog/getDefend.hbs';

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + game.i18n.localize('HM.dialog.getDefendTitle'),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    defend: {
                        label: game.i18n.localize('HM.defend'),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                'mod': parseInt(document.getElementById('mod').value || 0, 10)
                            })
                        }
                    }
                },
                default: 'defend'
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getAbilityDialog(dataset, caller) {
        const dialogData = {};
        const dialogResp = {caller};

        dialogData.ability = dataset.ability;
        const template = "systems/hackmaster5e/templates/dialog/getAbility.hbs";

        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + ": " + dialogData.ability + " " + game.i18n.localize("HM.roll"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    save: {
                        label: game.i18n.localize("HM.dialog.getAbilityButtonL"),
                        callback: () => {
                            resolve({
                                "save": true,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    },
                    check: {
                        label: game.i18n.localize("HM.dialog.getAbilityButtonR"),
                        callback: () => {
                            resolve({
                                "save": false,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "save"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = caller;
        dialogResp.resp.oper = dialogResp.resp.save ? "+" : "-";
        return dialogResp;
    }
}
