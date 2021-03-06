import { HMPrompt } from './prompt.js';
import { HMCONST, HMTABLES } from '../sys/constants.js';

function getSpeed(ranged, wData, specialMove=0) {
    const {spd, jspd} = wData.bonus.total;
    if (!ranged) return {melee: Number(specialMove) === HMCONST.SPECIAL.JAB ? jspd : spd};

    const {timing} = wData.ranged;
    return HMTABLES.weapons.ranged.timing(timing, spd);
}

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
        const capList = this.getCapList(weapon, dialogData?.caller);

        const wData = weapon.data.data;
        const ranged = wData.ranged.checked;
        const spd = getSpeed(ranged, wData);

        mergeObject(this.dialogData, {
            capList,
            specialMove: 0,
            ranged,
            spd,
            widx: 0,
            range: 0,
            advance: dialogData.inCombat,
        });
    }

    update(options) {
        const {weapons, widx, caller, specialMove} = this.dialogData;
        const weapon  = weapons[widx];
        const wData   = weapon.data.data;
        const ranged  = wData.ranged.checked;

        this.dialogData.ranged = ranged;
        this.dialogData.spd = getSpeed(ranged, wData, specialMove);
        this.dialogData.capList = this.getCapList(weapons[widx], caller);
        super.update(options);
    }

    get dialogResp() {
        const {button, spd} = this.dialogData;
        const dialogResp = {
            widx: this.dialogData.widx,
            specialMove: Number(this.dialogData.specialMove),
            range: Number(this.dialogData.range),
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            advance: this.dialogData.advance ? spd[button] : false,
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
