import { HMTABLES, HMCONST } from '../sys/constants.js';

export class HMDialogMgr {
    getDialog(dataset, caller=null) {
        const name = dataset.dialog;
        if (name === 'ability') return this.getAbilityDialog(dataset, caller);
        if (name === 'atk')     return this.getAttackDialog(dataset, caller);
        if (name === 'cast')    return this.getCastDialog(dataset, caller);
        if (name === 'ratk')    return this.getAttackDialog(dataset, caller);
        if (name === 'def')     return this.getDefendDialog(dataset, caller);
        if (name === 'dmg')     return this.getDamageDialog(dataset, caller);
        if (name === 'initdie') return this.getInitDieDialog(caller);
        if (name === 'save')    return this.getSaveDialog(dataset, caller);
        if (name === 'skill')   return this.getSkillDialog(dataset, caller);
        if (name === 'wound')   return this.setWoundDialog(caller);
    }

    _focusById(id) {
        return setTimeout(() => { document.getElementById(id).focus(); }, 50);
    }

    getWeapons(actor, itemId) {
        let weapons = [];
        if (itemId) {
            weapons.push(actor.items.get(itemId));
        } else {
            weapons = actor.items.filter(
                (a) => a.type === 'weapon'
                && HMCONST.ITEM_STATE.EQUIPPED <= a.data.data.state
            )
        }

        let ranged = false;
        weapons.forEach((weapon) => {
            if (weapon.data.data.ranged.checked) ranged = true;
        });
        return {weapons, ranged};
    }

    getSpells(actor, itemId) {
        if (itemId) return [actor.items.get(itemId)];
        return actor.items.filter((a) => a.type === 'spell');
    }

    async getInitDieDialog(caller) {
        const dialogResp = {caller};

        const template = 'systems/hackmaster5e/templates/dialog/getInitDie.hbs';
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize('HM.dialog.getInitDieTitle'),
                content: await renderTemplate(template),
                buttons: {
                    getdie: {
                        label: 'Roll',
                        callback: () => { resolve({
                            'die': document.getElementById('choices').value
                        })}
                    }
                },
                default:'getdie'
            }, {width: 300}).render(true);
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
        const dialogData = {};
        const dialogResp = {caller};

        const template = "systems/hackmaster5e/templates/dialog/getSave.hbs";
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize("HM.dialog.getSaveTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    save: {
                        label: game.i18n.localize("HM.dialog.getSaveTitle"),
                        callback: () => {
                            resolve({
                                "bonus": parseInt(document.getElementById("bonus").value) || 0
                            })
                        }
                    }
                },
                default: "save"
            }, {width: 175}).render(true);
            this._focusById('bonus');
        });
        dialogResp.context = caller;
        return dialogResp;
    }

    async getAttackDialog(dataset, caller) {
        const dialogResp = {caller};
        const dialogData = this.getWeapons(caller, dataset?.itemId);
        const template = 'systems/hackmaster5e/templates/dialog/getAttack.hbs';

        const penalty = HMTABLES.weapons.ranged.penalty;
        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + game.i18n.localize('HM.dialog.getAttackTitle'),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    attack: {
                        label: game.i18n.localize('HM.attack'),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                'mod': parseInt(document.getElementById('mod').value, 10) || 0,
                                'range': penalty[document.getElementById('range').value],
                                'rangestr': document.getElementById('range').value
                            })
                        }
                    }
                },
                default: 'attack'
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
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

    async getDamageDialog(dataset, caller) {
        const dialogResp = {caller};
        const dialogData = this.getWeapons(caller, dataset?.itemId);
        const template = 'systems/hackmaster5e/templates/dialog/getDamage.hbs';

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: caller.name + game.i18n.localize('HM.dialog.getDamageTitle'),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    normal: {
                        label: game.i18n.localize('HM.normal'),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                'shieldhit': false,
                                'dmg': dialogData.weapons[widx].data.data.dmg.normal,
                                'mod': parseInt(document.getElementById('mod').value || 0, 10)
                            })
                        }
                    },
                    shield: {
                        label: game.i18n.localize('HM.shield'),
                        icon: '<i class="fas fa-shield-alt"></i>',
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                'shieldhit': true,
                                'dmg': dialogData.weapons[widx].data.data.dmg.shield,
                                'mod': parseInt(document.getElementById('mod').value || 0, 10)
                            })
                        }
                    }
                },
                default: 'normal'
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getDefendDialog(dataset, caller) {
        const dialogResp = {caller};
        const dialogData = this.getWeapons(caller, dataset?.itemId);
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

    async getSkillDialog(dataset, caller) {
        const dialogResp = {caller};
        const dialogData = {
            rollModes: CONFIG.Dice.rollModes,
            rollMode: game.settings.get('core', 'rollMode'),
        };

        dialogData.skill = caller.items.get(dataset.itemId);
        const template = 'systems/hackmaster5e/templates/dialog/getSkill.hbs';

        const titlePre = dataset.callers > 1 ? `${dataset.callers}` : `${caller.name}:`;
        const titlePost = dataset.callers > 1
            ? game.i18n.localize('HM.dialog.getSkillTitle2')
            : game.i18n.localize('HM.dialog.getSkillTitle1');
        const title = `${titlePre} ${game.i18n.localize(dialogData.skill.name)} ${titlePost}`;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title,
                content: await renderTemplate(template, dialogData),
                buttons: {
                    standard: {
                        label: game.i18n.localize('HM.skillcheck'),
                        callback: () => {
                            resolve({
                                'opposed': false,
                                'bonus': parseInt(document.getElementById('bonus').value || 0, 10),
                                'rollMode': document.getElementById('rollMode').value,
                            });
                        },
                    },
                    opposed: {
                        label: `${game.i18n.localize('HM.opposed')} ${game.i18n.localize('HM.check')}`,
                        callback: () => {
                            resolve({
                                'opposed': true,
                                'bonus': parseInt(document.getElementById('bonus').value || 0, 10),
                                'rollMode': document.getElementById('rollMode').value,
                            });
                        },
                    },
                },
                default: 'standard',
            }).render(true);
            this._focusById('bonus');
        });
        dialogResp.context = dialogData.skill;
        dialogResp.resp.oper = dialogResp.resp.opposed ? '+' : '-';
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
