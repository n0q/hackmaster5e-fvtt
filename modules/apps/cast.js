import { HMPrompt } from './prompt.js';
import { HMTABLES, SYSTEM_ID } from '../tables/constants.js';

export class CastPrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
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

        foundry.utils.mergeObject(this.dialogData, {
            cost: getSpellCost(spell, caller),
            spd: getSpellSpeed(sData, caller),
            spellName: spell.name,
            divine,
            advance: dialogData.inCombat,
            sidx: 0,
            lidx,
            prepped,
            schedule: getPrevSchedule(caller, spell),
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
        const {button, caller, divine, sidx, spd, spells} = this.dialogData;
        const schedule = parseInt(this.dialogData.schedule, 10) || 0;
        const stage = getVolatilityStage(spells[sidx], schedule, caller);
        const svr = getSpellVolatility(spells[sidx], schedule, stage, caller);

        if (!divine) {
            if (button === 'declare') {
                const lastSpell = {id: spells[0].id, schedule};
                caller.setFlag(SYSTEM_ID, 'lastSpell', lastSpell);
            } else if (button === 'cast') {
                caller.unsetFlag(SYSTEM_ID, 'lastSpell');
            }
        }

        const dialogResp = {
            stage,
            svr,
            smc: HMTABLES.spell.smc(svr),
            sfc: HMTABLES.spell.sfc(svr),
            sidx,
            divine,
            cost: this.dialogData.cost,
            schedule,
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

// TODO: Extended stages via leyline.
function getVolatilityStage(spell, schedule, caller) {
    const {baseSPC, system} = spell;
    const {prepped} = system;
    const [callerClass] = caller.itemTypes.cclass;

    const freeCast = callerClass ? callerClass.system.caps.fcast : false;
    const overhead = freeCast ? 0 : !prepped * baseSPC;
    const isAmped = schedule || overhead;
    const stage = isAmped ? Math.floor((baseSPC + overhead + schedule - 1) / baseSPC) : 0;
    return Math.min(stage, 2);
}

function getSpellVolatility(spell, schedule, stage, caller) {
    const {lidx} = spell.system;
    const [callerClass] = caller.itemTypes.cclass;
    const freeCast = callerClass ? callerClass.system.caps.fcast : false;
    const svr = HMTABLES.spell.svr(Number(lidx), stage);
    return freeCast ? 2 * svr : svr;
}

/**
 * Retrieves the previous schedule of a given spell used by the caller.
 *
 * @param {HMActor} caller - The object representing the caller.
 * @param {HMSpellItem} spell - The spell object to check against previous usage.
 * @returns {number|undefined} The integer schedule of the last spell cast if it matches
 * the current spell's id, otherwise undefined.
 */
function getPrevSchedule(caller, spell) {
    const lastSpell = caller.getFlag(SYSTEM_ID, 'lastSpell');
    if (!lastSpell || lastSpell.id !== spell.id) return undefined;
    return lastSpell.schedule;
}
