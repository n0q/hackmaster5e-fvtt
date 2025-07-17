import { HMPrompt } from './prompt.js';
import { HMCONST } from '../../tables/constants.js';

function getSeverity({ atkRoll, defRoll, dmg, dr }) {
    const attacker = (Number(atkRoll) || 0) + (Number(dmg) || 0);
    const defender = (Number(defRoll) || 0) + (Number(dr) || 0);
    return attacker - defender;
}

export class CritPrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/crit.hbs',
            id: 'critPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const { caller } = dialogData;
        const callerRace = caller?.itemTypes?.race[0] ?? undefined;

        const atkSize = callerRace ? callerRace.getScale('hp') : HMCONST.SCALE.MEDIUM;
        const defSize = HMCONST.SCALE.MEDIUM;
        const [atkRoll, defRoll] = [0, 0];
        foundry.utils.mergeObject(this.dialogData, {
            atkSize,
            defSize,
            atkRoll,
            defRoll,
            dmg: 0,
            dr: 0,
            dmgType: HMCONST.DMGTYPE.CRUSHING,
        });
    }

    update(options) {
        super.update(options);
    }

    get dialogResp() {
        const { atkRoll, defRoll, dmg, dr } = this.dialogData;
        const dialogResp = {
            severity: getSeverity({ atkRoll, defRoll, dmg, dr }),
            atkRoll: Number(this.dialogData.atkRoll),
            defRoll: Number(this.dialogData.defRoll),
            atkSize: Number(this.dialogData.atkSize),
            defSize: Number(this.dialogData.defSize),
            dmg: Number(this.dialogData.dmg),
            dr: Number(this.dialogData.dr),
            dmgType: this.dialogData.dmgType,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
