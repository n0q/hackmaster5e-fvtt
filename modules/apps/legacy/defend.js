import { HMPrompt } from "./prompt.js";
import { HMCONST, HMTABLES, SYSTEM_ID } from "../../tables/constants.js";

function getSpeed(ranged, wData, specialMove = 0) {
    const { spd, jspd } = wData.bonus.total;
    if (!ranged) {
        return {
            declare: spd,
            melee: Number(specialMove) === HMCONST.SPECIAL.JAB ? jspd : spd,
        };
    }

    const { timing } = wData.ranged;
    return HMTABLES.weapons.ranged.timing(timing, spd);
}

export class DefendPrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/hackmaster5e/templates/dialog/defend.hbs",
            id: "defendPrompt",
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const widx = HMPrompt.getLastWeaponIndex(dialogData);
        const weapon = dialogData.weapons[widx];
        const { caller } = dialogData;

        const capList = this.getCapList(weapon, caller);
        const weaponsList = HMPrompt.getSelectFromProperty(dialogData.weapons, "name");
        const canDodge = caller[SYSTEM_ID].talent.flag.dodge;
        const wData = weapon.system;
        const ranged = wData.ranged.checked;
        const spd = getSpeed(ranged, wData);

        foundry.utils.mergeObject(this.dialogData, {
            capList,
            weaponsList,
            specialMove: HMCONST.SPECIAL.STANDARD,
            defDie: wData.defdie,
            rDefDie: HMCONST.DIE.D20P,
            canDodge: canDodge || caller.type === "beast",
            dodge: canDodge,
            ranged,
            spd,
            widx,
            range: 0,
            advance: dialogData.inCombat,
            SPECIAL: HMCONST.SPECIAL,
        });
    }

    getCapList(weapon, actor = null) {
        const capsObj = super.getCapList(weapon, actor);
        delete capsObj[HMCONST.SPECIAL.BACKSTAB];
        return capsObj;
    }

    update(options) {
        const { weapons, widx, caller } = this.dialogData;
        let { specialMove } = this.dialogData;
        const weapon = weapons[widx];
        const wData = weapon.system;
        const ranged = wData.ranged.checked;
        const capList = this.getCapList(weapons[widx], caller);

        if (!(specialMove in capList)) specialMove = Object.keys(capList)[0];

        this.dialogData.ranged = ranged;
        this.dialogData.spd = getSpeed(ranged, wData, specialMove);
        this.dialogData.specialMove = specialMove;
        this.dialogData.capList = capList;
        super.update(options);
    }

    get dialogResp() {
        const { caller, button, spd, defDie, rDefDie, widx, weapons } = this.dialogData;
        caller.setFlag(SYSTEM_ID, "lastWeapon", weapons[widx].weapon.id);
        const specialMove = Number(this.dialogData.specialMove);
        const { SPECIAL } = HMCONST;
        const dialogResp = {
            context: weapons[widx].weapon.uuid,
            defdie: specialMove === SPECIAL.RDEFEND ? HMTABLES.die[rDefDie] : HMTABLES.die[defDie],
            dodge: this.dialogData.dodge ? this.dialogData.dodge : 0,
            widx,
            specialMove,
            range: Number(this.dialogData.range),
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            advance: false,
            duration: specialMove === SPECIAL.DEFEND ? false : (spd?.melee || 0),
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
