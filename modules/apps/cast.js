import { HMPrompt } from './prompt.js';
import { HMTABLES } from '../tables/constants.js';

export class CastPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/cast.hbs',
            id: 'castPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const {caller} = dialogData;
        const spell = dialogData.spells[0];
        const sData = spell.system;
        const {divine, lidx, prepped} = sData;

        mergeObject(this.dialogData, {
            cost: getSpellCost(spell, caller),
            spd: getSpellSpeed(sData, caller),
            divine,
            advance: dialogData.inCombat,
            sidx: 0,
            lidx,
            prepped,
        });
    }

    update(options) {
        const {spells, sidx, caller} = this.dialogData;
        const spell = spells[sidx];
        const sData = spell.system;
        const {divine, lidx} = sData;

        this.dialogData.cost = getSpellCost(spell, caller);
        this.dialogData.spd = getSpellSpeed(sData, caller);
        this.dialogData.divine = divine;
        this.dialogData.lidx = lidx;
        super.update(options);
    }

    get dialogResp() {
        const {button, spd, divine} = this.dialogData;
        const dialogResp = {
            sidx: this.dialogData.sidx,
            divine,
            cost: this.dialogData.cost,
            schedule: parseInt(this.dialogData.schedule, 10) || 0,
            advance: spd[button],
            sfatigue: !divine && button === 'cast' ? spd.sfatigue : false,
            private: this.dialogData.private,
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}

function getSpellSpeed(sData, caller) {
    return HMTABLES.cast.timing(sData.speed, caller);
}

function getSpellCost(spell, caller) {
    const {prepped} = spell.system;
    const {baseSPC} = spell;

    const [callerClass] = caller.itemTypes.cclass;
    const freeCast = callerClass ? callerClass.system.caps.fcast : false;
    if (freeCast) return 0;
    return prepped ? baseSPC : baseSPC * 2;
}
