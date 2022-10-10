import { HMPrompt } from './prompt.js';
import { HMCONST, HMTABLES } from '../sys/constants.js';

function getSpeed(ranged, wData, specialMove=0) {
    const {spd, jspd} = wData.bonus.total;

    if (ranged) {
        const {timing} = wData.ranged;
        return HMTABLES.weapons.ranged.timing(timing, spd);
    }

    const s4c = HMTABLES.weapons.s4c.spd;

    return {
        declare: Number(specialMove) === HMCONST.SPECIAL.SET4CHARGE ? s4c : spd,
        melee: Number(specialMove) === HMCONST.SPECIAL.JAB ? jspd : spd,
    };
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

        const wData = weapon.system;
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
            SPECIAL: HMCONST.SPECIAL,
            charge: HMCONST.SPECIAL.CHARGE4,
        });
    }

    update(options) {
        const {weapons, widx, caller} = this.dialogData;
        let {specialMove} = this.dialogData;
        const weapon  = weapons[widx];
        const wData   = weapon.system;
        const ranged  = wData.ranged.checked;
        const capList = this.getCapList(weapons[widx], caller);

        if (!(specialMove in capList)) specialMove = Object.keys(capList)[0];

        this.dialogData.ranged = ranged;
        this.dialogData.spd = getSpeed(ranged, wData, specialMove);
        this.dialogData.specialMove = specialMove;
        this.dialogData.capList = capList;
        super.update(options);
    }

    get dialogResp() {
        const {button, charge, spd, widx} = this.dialogData;
        let specialMove = Number(this.dialogData.specialMove);
        if (specialMove === HMCONST.SPECIAL.CHARGE) specialMove = Number(charge);

        const dialogResp = {
            widx,
            specialMove,
            range: Number(this.dialogData.range),
            bonus: Number(this.dialogData.bonus) || 0,
            advance: this.dialogData.advance ? spd[button] : false,
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
