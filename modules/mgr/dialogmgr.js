export default class HMDialogMgr {
    async getDialog(actor, dataset) {
        const name = dataset.dialog;
        if (name === 'setWound') { return this.setWound();                     } else
        if (name === 'atk')      { return this.getAttackDialog(actor, dataset) } else
        if (name === 'dmg')      { return this.getDamageDialog(actor, dataset) } else
        if (name === 'def')      { return this.getDefendDialog(actor, dataset) } else
        if (name === 'skill')    { return this.getSkillDialog(actor, dataset)  }
    }

    _focusById(id) {
        return setTimeout(() => {document.getElementById(id).focus()}, 50);
    }

    getWeapons(actor, itemId) {
        if (itemId) return [actor.items.get(itemId)];
        return actor.items.filter((a) => a.type === "weapon");
    }

    async setWound() {
        return await new Promise(async resolve => {
            new Dialog({
                title: game.i18n.localize("HM.dialog.setWoundTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/setWound.hbs"),
                buttons: {
                    wound: {
                        label: game.i18n.localize("HM.dialog.setWoundTitle"),
                        callback: () => { resolve(parseInt(document.getElementById("hp").value)) }
                    }
                },
                default: "wound"
            }, {width: 175}).render(true);
            this._focusById('hp');
        });
    }

    async getAttackDialog(actor, dataset) {
        const dialogData = {};
        const dialogResp = {"caller": actor};

        dialogData.weapons = this.getWeapons(actor, dataset?.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getAttack.hbs";

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: actor.name + game.i18n.localize("HM.dialog.getAttackTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    attack: {
                        label: game.i18n.localize("HM.attack"),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0),
                            })
                        }
                    }
                },
                default: "attack"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getDamageDialog(actor, dataset) {
        const dialogData = {};
        const dialogResp = {"caller": actor};

        dialogData.weapons = this.getWeapons(actor, dataset?.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getDamage.hbs";

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: actor.name + game.i18n.localize("HM.dialog.getDamageTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    normal: {
                        label: game.i18n.localize("HM.normal"),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "shieldhit": false,
                                "dmg": dialogData.weapons[widx].data.data.dmg.normal,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    },
                    shield: {
                        label: game.i18n.localize("HM.shield"),
                        icon: '<i class="fas fa-shield-alt"></i>',
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "shieldhit": true,
                                "dmg": dialogData.weapons[widx].data.data.dmg.shield,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "normal"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getDefendDialog(actor, dataset) {
        const dialogData = {};
        const dialogResp = {"caller": actor};

        dialogData.weapons = this.getWeapons(actor, dataset?.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getDefend.hbs";

        let widx = null;
        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: actor.name + game.i18n.localize("HM.dialog.getDefendTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    defend: {
                        label: game.i18n.localize("HM.defend"),
                        callback: (html) => {
                            widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "defend"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.weapons[widx];
        return dialogResp;
    }

    async getSkillDialog(actor, dataset) {
        const dialogData = {};
        const dialogResp = {"caller": actor};

        dialogData.skill = actor.items.get(dataset.itemId);
        const template = "systems/hackmaster5e/templates/dialog/getSkill.hbs";

        dialogResp.resp = await new Promise(async resolve => {
            new Dialog({
                title: actor.name + ": " + dialogData.skill.name + game.i18n.localize("HM.dialog.getSkillTitle"),
                content: await renderTemplate(template, dialogData),
                buttons: {
                    standard: {
                        label: game.i18n.localize("HM.skillcheck"),
                        callback: () => {
                            resolve({
                                "opposed": false,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    },
                    opposed: {
                        label: game.i18n.localize("HM.opposedcheck"),
                        callback: () => {
                            resolve({
                                "opposed": true,
                                "mod": parseInt(document.getElementById("mod").value || 0)
                            })
                        }
                    }
                },
                default: "standard"
            }).render(true);
            this._focusById('mod');
        });
        dialogResp.context = dialogData.skill;
        dialogResp.resp.oper = dialogResp.resp.opposed ? "+" : "-";
        return dialogResp;
    }

}
