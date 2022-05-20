import { HMPrompt } from './prompt.js';
import { HMTABLES } from '../sys/constants.js';

function getSpeed(sData, caller) {
    const spd = HMTABLES.cast.timing(sData.speed, caller);
    if (sData.divine) spd.cast = false;
    return spd;
}

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
        const sData = spell.data.data;
        const spd = getSpeed(sData, caller);
        const {divine, lidx, prepped} = sData;
        const cost = HMTABLES.cast.cost(lidx, prepped);

        mergeObject(this.dialogData, {
            cost,
            spd,
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
        const sData = spell.data.data;
        const {divine, lidx, prepped} = sData;

        this.dialogData.cost = HMTABLES.cast.cost(lidx, prepped);
        this.dialogData.spd = getSpeed(sData, caller);
        this.dialogData.divine = divine;
        this.dialogData.lidx = lidx;
        super.update(options);
    }

    get dialogResp() {
        const {button, spd} = this.dialogData;
        const dialogResp = {
            sidx: this.dialogData.sidx,
            divine: this.dialogData.divine,
            cost: this.dialogData.cost,
            schedule: parseInt(this.dialogData.schedule, 10) || 0,
            advance: this.dialogData.advance ? spd[button] : false,
            button,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
