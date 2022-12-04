import { HMPrompt } from './prompt.js';
import { HMCONST, HMTABLES } from '../tables/constants.js';

function getSpeed(ranged, wData, specialMove=0) {
    const {spd, jspd} = wData.bonus.total;
    if (!ranged) {
        return {
            declare: spd,
            melee: Number(specialMove) === HMCONST.SPECIAL.JAB ? jspd : spd,
        };
    }

    const {timing} = wData.ranged;
    return HMTABLES.weapons.ranged.timing(timing, spd);
}

export class DefendPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/defend.hbs',
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
            specialMove: HMCONST.SPECIAL.STANDARD,
            defDie: wData.defdie,
            dodge: false,
            ranged,
            spd,
            widx: 0,
            range: 0,
            advance: dialogData.inCombat,
            SPECIAL: HMCONST.SPECIAL,
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
        const {button, spd, defDie} = this.dialogData;
        const specialMove = Number(this.dialogData.specialMove);
        const dialogResp = {
            defdie: HMTABLES.die[defDie],
            dodge: this.dialogData.dodge ? this.dialogData.dodge : 0,
            widx: this.dialogData.widx,
            specialMove,
            range: Number(this.dialogData.range),
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            advance: false,
            duration: specialMove === HMCONST.SPECIAL.DEFEND ? false : (spd?.melee || 0),
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
