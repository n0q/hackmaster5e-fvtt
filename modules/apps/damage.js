import { HMPrompt } from './prompt.js';
import { HMCONST } from '../sys/constants.js';

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
        const capList = this.getCapList(weapon.capabilities, dialogData?.callerId);

        mergeObject(this.dialogData, {
            callerId: dialogData?.callerId,
            capList,
            specialMove: 0,
            widx: 0,
        });
    }

    update(options) {
        const {weapons, widx, callerId} = this.dialogData;
        this.dialogData.capList = this.getCapList(weapons[widx].capabilities, callerId);
        super.update(options);
    }

    get dialogResp() {
        const specialMove = Number(this.dialogData.specialMove);
        const shieldHit = this.dialogData.shieldHit === 'true';
        const jabbed   = specialMove === HMCONST.SPECIAL.JAB;
        const backstab = specialMove === HMCONST.SPECIAL.BACKSTAB;
        let formulaType;
        /* eslint 'space-in-parens': 0 */

        if (backstab && !shieldHit) { formulaType = 'bstab';       } else
        if (backstab &&  shieldHit) { formulaType = 'shieldbstab'; } else
        if (!jabbed  && !shieldHit) { formulaType = 'standard';    } else
        if (!jabbed  &&  shieldHit) { formulaType = 'shield';      } else
        if ( jabbed  && !shieldHit) { formulaType = 'jab';         } else
        if ( jabbed  &&  shieldHit) { formulaType = 'shieldjab';   }

        const dialogResp = {
            widx: this.dialogData.widx,
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            specialMove,
            shieldHit,
            formulaType,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
