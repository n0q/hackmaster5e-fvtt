import { HMPrompt } from './prompt.js';
import { HMCONST } from '../sys/constants.js';

export class AttackPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getAttack.hbs',
            id: 'attackPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const weapon = dialogData.weapons[0];
        const capList = this.getCapList(weapon.capabilities, dialogData?.caller);

        mergeObject(this.dialogData, {
            caller: dialogData?.caller,
            capList,
            specialMove: 0,
            ranged: weapon.data.data.ranged.checked,
            spd: weapon.data.data.bonus.total.spd,
            widx: 0,
            range: 0,
            advance: dialogData.inCombat,
        });
    }

    update(options) {
        const {weapons, widx, caller} = this.dialogData;
        const weapon   = weapons[widx];
        const wData    = weapon.data.data;
        const {ranged} = wData;
        const spd = Number(this.dialogData.specialMove) === HMCONST.SPECIAL.JAB
                        ? wData.bonus.total.jspd
                        : wData.bonus.total.spd;

        this.dialogData.ranged = ranged.checked;
        this.dialogData.spd = spd;
        this.dialogData.capList = this.getCapList(weapons[widx].capabilities, caller);
        super.update(options);
    }

    get dialogResp() {
        const dialogResp = {
            widx: this.dialogData.widx,
            specialMove: Number(this.dialogData.specialMove),
            range: Number(this.dialogData.range),
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            advance: this.dialogData.advance ? this.dialogData.spd : false,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
