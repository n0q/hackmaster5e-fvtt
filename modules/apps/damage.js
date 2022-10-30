import { HMPrompt } from './prompt.js';
import { HMCONST, HMTABLES } from '../sys/constants.js';

export class DamagePrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getDamage.hbs',
            id: 'damagePrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const weapon = dialogData.weapons[0];
        const capList = this.getCapList(weapon, dialogData?.caller);
        const wData = weapon.system;
        const canStrBonus = wData.ranged.checked ? !wData.ranged?.mechanical : false;

        mergeObject(this.dialogData, {
            capList,
            specialMove: 0,
            widx: 0,
            canStrBonus,
        });
    }

    getCapList(weapon, actor=null) {
        const capsObj = super.getCapList(weapon, actor);
        delete capsObj[HMCONST.SPECIAL.AGGRESSIVE];
        delete capsObj[HMCONST.SPECIAL.FULLPARRY];
        delete capsObj[HMCONST.SPECIAL.WITHDRAWL];
        delete capsObj[HMCONST.SPECIAL.CHARGE];
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
        const specialMove = Number(this.dialogData.specialMove);
        const shieldHit = this.dialogData.shieldHit === 'true';
        const jabbed   = specialMove === HMCONST.SPECIAL.JAB;
        const backstab = specialMove === HMCONST.SPECIAL.BACKSTAB;
        const {caller, strBonus, weapons, widx} = this.dialogData;
        const wData = weapons[widx].system;
        let bonus = parseInt(this.dialogData.bonus, 10) || 0;

        let formulaType;
        let autoFormula = false;

        if (jabbed) {
            const {normal, shield} = weapons[widx].system.jab;
            const autoStd    = (!normal || normal === 'auto');
            const autoShield = (!shield || shield === 'auto');

            if (!shieldHit) { formulaType = autoStd    ? 'standard' : 'jab';       } else
            if  (shieldHit) { formulaType = autoShield ? 'shield'   : 'shieldjab'; }
            autoFormula = autoStd || autoShield;
        } else

        if (backstab && !shieldHit) { formulaType = 'bstab';       } else
        if (backstab &&  shieldHit) { formulaType = 'shieldbstab'; } else
        if             (!shieldHit) { formulaType = 'standard';    } else
        if              (shieldHit) { formulaType = 'shield';      }

        if (strBonus && wData.ranged.checked && !wData.ranged?.mechanical) {
            const strBonusValue = caller.getAbilityBonus('str', 'dmg');
            bonus += Math.max(0, strBonusValue);
        }

        const dialogResp = {
            widx,
            bonus,
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
