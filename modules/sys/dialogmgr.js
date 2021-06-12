import LOGGER from "./logger.js";

export default class HMDialogMgr {
    constructor() { LOGGER.log("NEW HMDialogManager"); }

    async getDialog(nameD, data={}) {
        const name = DOMPurify.sanitize(nameD);
        if (name === 'setWound')  { return this.setWound();      } else
        if (name === 'atk')       { return this.getAttack(data); } else
        if (name === 'dmg')       { return this.getDamage(data); } else
        if (name === 'def')       { return this.getDefend(data); }
    }

    _focusById(id) {
        return setTimeout(() => {document.getElementById(id).focus()}, 50);
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
            }).render(true);
            this._focusById('hp');
        });
    }

    async getAttack(data) {
        const actor = data.actor;
        const weapons = data.weapons;
        return await new Promise(async resolve => {
            new Dialog({
                title: actor.name + game.i18n.localize("HM.dialog.getAttackTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/getAttack.hbs", weapons),
                buttons: {
                    attack: {
                        label: game.i18n.localize("HM.attack"),
                        callback: (html) => {
                            const widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0),
                                "weapon": weapons.weapon[widx]
                            })
                        }
                    }
                },
                default: "attack"
            }).render(true);
            this._focusById('mod');
        });
    }

    async getDamage(data) {
        const actor = data.actor;
        const weapons = data.weapons;
        return await new Promise(async resolve => {
            new Dialog({
                title: actor.name + game.i18n.localize("HM.dialog.getDamageTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/getDamage.hbs", weapons),
                buttons: {
                    normal: {
                        label: game.i18n.localize("HM.normal"),
                        callback: (html) => {
                            const widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "dmgtype": "normal",
                                "mod": parseInt(document.getElementById("mod").value || 0),
                                "weapon": weapons.weapon[widx]
                            })
                        }
                    },
                    shield: {
                        label: game.i18n.localize("HM.shield"),
                        icon: '<i class="fas fa-shield-alt"></i>',
                        callback: (html) => {
                            const widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "dmgtype": "shield",
                                "mod": parseInt(document.getElementById("mod").value || 0),
                                "weapon": weapons.weapon[widx]
                            })
                        }
                    }
                },
                default: "normal"
            }).render(true);
            this._focusById('mod');
        });
    }

    async getDefend(data) {
        const actor = data.actor;
        const weapons = data.weapons;
        return await new Promise(async resolve => {
            new Dialog({
                title: actor.name + game.i18n.localize("HM.dialog.getDefendTitle"),
                content: await renderTemplate("systems/hackmaster5e/templates/dialog/getDefend.hbs", weapons),
                buttons: {
                    defend: {
                        label: game.i18n.localize("HM.defend"),
                        callback: (html) => {
                            const widx = html.find('#weapon-select')[0].value;
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0),
                                "weapon": weapons.weapon[widx]
                            })
                        }
                    }
                },
                default: "defend"
            }).render(true);
            this._focusById('mod');
        });
    }

}
