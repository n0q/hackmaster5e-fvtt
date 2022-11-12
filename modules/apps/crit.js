import { HMPrompt } from './prompt.js';
import { HMCONST } from '../sys/constants.js';

function getSeverity({atkRoll, defRoll, dmg, dr}) {
    const attacker = (Number(atkRoll) || 0) + (Number(dmg) || 0);
    const defender = (Number(defRoll) || 0) + (Number(dr)  || 0);
    return attacker - defender;
}

export class CritPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/crit.hbs',
            id: 'critPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const {caller} = dialogData;
        const callerRace = caller?.itemTypes?.race[0] ?? undefined;

        const atkSize = callerRace ? callerRace.system.scale.hp : HMCONST.SCALE.MEDIUM;
        const defSize = HMCONST.SCALE.MEDIUM;
        const [atkRoll, defRoll] = [0, 0];
        mergeObject(this.dialogData, {
            atkSize,
            defSize,
            atkRoll,
            defRoll,
            dmg: 0,
            dr: 0,
            dmgType: HMCONST.DMGTYPE.CRUSHING,
            canCrit: atkRoll > defRoll,
        });
    }

    update(options) {
        const {atkRoll, defRoll} = this.dialogData;
        this.dialogData.canCrit = Number(atkRoll) > Number(defRoll);
        super.update(options);
    }

    get dialogResp() {
        const {atkRoll, defRoll, dmg, dr} = this.dialogData;
        const dialogResp = {
            severity: getSeverity({atkRoll, defRoll, dmg, dr}),
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