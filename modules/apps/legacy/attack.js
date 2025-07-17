import { HMPrompt } from './prompt.js';
import { HMCONST, HMTABLES, SYSTEM_ID } from '../tables/constants.js';

function getSpeed(ranged, wData, specialMove=0) {
    const {spd, jspd} = wData.bonus.total;

    if (ranged) {
        const {timing} = wData.ranged;
        return HMTABLES.weapons.ranged.timing(timing, spd);
    }

    const s4c = HMTABLES.weapons.s4c.spd;
    const resetSpd = Math.ceil(spd / 2) || 0;

    return {
        declare: Number(specialMove) === HMCONST.SPECIAL.SET4CHARGE ? s4c : spd,
        melee: Number(specialMove) === HMCONST.SPECIAL.JAB ? jspd : spd,
        reset: resetSpd,
    };
}

function getDefense(effects) {
    if (!effects) return HMCONST.DEFENSE.DEFENSE0;
    const dList = Object.values(HMTABLES.effects.defense);
    const fxList = effects.contents.flatMap((fx) => [...fx.statuses.keys()]);
    return dList.findIndex((value) => fxList.includes(value)) + 1;
}

export class AttackPrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getAttack.hbs',
            id: 'attackPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);

        const widx = HMPrompt.getLastWeaponIndex(dialogData);
        const weapon = dialogData.weapons[widx];
        const weaponsList = HMPrompt.getSelectFromProperty(dialogData.weapons, 'name');
        const inCombat = dialogData.inCombat ?? false;
        const capList = this.getCapList(weapon, dialogData?.caller, inCombat);
        const defense = getDefense(dialogData?.caller.effects);

        const wData = weapon.system;
        const ranged = wData.ranged.checked;
        const reach = wData.ranged?.reach ?? wData.reach;
        const spd = getSpeed(ranged, wData);
        if (ranged) spd.declareMode = spd.declare;
        const {SPECIAL} = HMCONST;

        foundry.utils.mergeObject(this.dialogData, {
            capList,
            canShoot: true,
            specialMove: ranged ? SPECIAL.RSTANDARD : SPECIAL.STANDARD,
            defense,
            ranged,
            reach,
            spd,
            weaponsList,
            widx,
            range: HMCONST.RANGED.REACH.SHORT,
            advance: inCombat,
            SPECIAL,
            charge: SPECIAL.CHARGE4,
        });
    }

    update(options) {
        const {weapons, widx, caller, inCombat} = this.dialogData;
        const {SPECIAL} = HMCONST;
        let specialMove = Number(this.dialogData.specialMove);
        const weapon  = weapons[widx];
        const wData   = weapon.system;
        const ranged  = wData.ranged.checked;
        const reach   = wData.ranged?.reach ?? wData.reach;
        const capList = this.getCapList(weapons[widx], caller, inCombat ?? false);

        if (!(specialMove in capList)) specialMove = Object.keys(capList)[0];

        this.dialogData.canShoot = ranged
            ? [SPECIAL.RSTANDARD, SPECIAL.SNAPSHOT].includes(Number(specialMove))
            : false;

        this.dialogData.ranged = ranged;
        this.dialogData.reach = reach;
        this.dialogData.spd = getSpeed(ranged, wData, specialMove);
        this.dialogData.specialMove = specialMove;
        this.dialogData.capList = capList;
        super.update(options);
    }

    get dialogResp() {
        const {button, caller, charge, spd, weapons, widx} = this.dialogData;

        let specialMove = Number(this.dialogData.specialMove);
        if (specialMove === HMCONST.SPECIAL.CHARGE) specialMove = Number(charge);

        const ranged = !!weapons[widx].system.ranged.checked;
        const advance = ranged && button !== 'shoot' ? spd[specialMove] : spd[button];
        const defense = specialMove === HMCONST.SPECIAL.FULLPARRY
            ? HMCONST.DEFENSE.FULLPARRY
            : Number(this.dialogData.defense);

        caller.setFlag(SYSTEM_ID, 'lastWeapon', weapons[widx].weapon.id);

        const dialogResp = {
            widx,
            specialMove,
            defense,
            ranged,
            reach: Number(this.dialogData.range),
            reachmod: HMTABLES.weapons.ranged.reach[this.dialogData.range],
            bonus: Number(this.dialogData.bonus) || 0,
            advance: this.dialogData.advance ? advance : false,
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
