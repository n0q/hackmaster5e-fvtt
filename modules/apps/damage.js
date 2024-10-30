import { HMPrompt } from './prompt.js';
import { HMCONST, SYSTEM_ID } from '../tables/constants.js';
import { idx } from '../tables/dictionary.js';

export class DamagePrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getDamage.hbs',
            id: 'damagePrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);

        const widx = HMPrompt.getLastWeaponIndex(dialogData);
        const weapon = dialogData.weapons[widx];
        const capList = this.getCapList(weapon, dialogData?.caller);
        const wData = weapon.system;
        const canStrBonus = wData.ranged.checked ? !wData.ranged?.mechanical : false;
        const weaponsList = HMPrompt.getSelectFromProperty(dialogData.weapons, 'name');

        foundry.utils.mergeObject(this.dialogData, {
            capList,
            specialMove: 0,
            widx,
            weaponsList,
            canStrBonus,
        });
    }

    getCapList(weapon, actor=null) {
        const capsObj = super.getCapList(weapon, actor);
        const {SPECIAL} = HMCONST;
        const {special} = idx;
        const ranged = weapon.system.ranged.checked;
        delete capsObj[SPECIAL.AGGRESSIVE];
        delete capsObj[SPECIAL.FULLPARRY];
        delete capsObj[SPECIAL.WITHDRAWL];
        delete capsObj[SPECIAL.CHARGE];
        delete capsObj[SPECIAL.RESET];
        if (actor.canBackstab && !ranged) capsObj[SPECIAL.BACKSTAB] = special[SPECIAL.BACKSTAB];
        return capsObj;
    }

    update(options) {
        const {weapons, widx, caller} = this.dialogData;
        let {specialMove} = this.dialogData;
        const capList = this.getCapList(weapons[widx], caller);

        const wData = weapons[widx].system;
        const canStrBonus = wData.ranged.checked ? !wData.ranged?.mechanical : false;

        if (!(specialMove in capList)) specialMove = Object.keys(capList)[0];

        this.dialogData.canStrBonus = canStrBonus;
        this.dialogData.specialMove = specialMove;
        this.dialogData.capList = capList;
        super.update(options);
    }

    get dialogResp() {
        const {DMGFORM, SPECIAL} = HMCONST;
        const {addStrBonus, caller, weapons, widx} = this.dialogData;
        caller.setFlag(SYSTEM_ID, 'lastWeapon', weapons[widx].weapon.id);

        const wData = weapons[widx].system;
        const specialMove  = Number(this.dialogData.specialMove);
        const shieldHit    = this.dialogData.shieldHit === 'true';
        const isJab        = specialMove === SPECIAL.JAB;
        const isBackstab   = specialMove === SPECIAL.BACKSTAB;
        const isRanged     = wData.ranged.checked;

        let autoFormula = false;
        let formulaType = shieldHit ? DMGFORM.SHIELD : DMGFORM.STD;

        if (isBackstab) { formulaType += DMGFORM.BSTAB; } else
        if (isRanged)   { formulaType += DMGFORM.RSTD; } else
        if (isJab) {
            const {jab} = weapons[widx].system;
            const jabFormula = shieldHit ? jab?.shield : jab?.normal;

            jabFormula && jabFormula !== 'auto'
                ? formulaType += DMGFORM.JAB
                : autoFormula = true;
        }

        const dialogResp = {
            widx,
            addStrBonus,
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            defense: this.dialogData?.caller.fightingDefensively,
            specialMove,
            shieldHit,
            formulaType,
            autoFormula,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
