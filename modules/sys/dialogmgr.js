import LOGGER from "./logger.js";

export default class HMDialogMgr {
    constructor() { LOGGER.log("NEW HMDialogManager"); }

    async getDialog(nameD, data={}) {
        const name = DOMPurify.sanitize(nameD);
        if (name === 'setWound')  { return this.setWound();      } else
        if (name === 'getAttack') { return this.getAttack(data); }
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
                            resolve({
                                "mod": parseInt(document.getElementById("mod").value || 0),
                                "weapon": weapons.weapon[html.find('#weapon-select')[0].value]
                            })
                        }
                    }
                },
                default: "attack"
            }).render(true);
            this._focusById('mod');
        });
    }


}
