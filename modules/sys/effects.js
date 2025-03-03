import { HMCONST } from '../tables/constants.js';

/* eslint max-classes-per-file: ['error', 2] */
export const actorHasEffects = (actor, statusList) => {
    const effects = actor.effects.filter((fx) => !fx.disabled);
    const fxList = effects.flatMap((fx) => [...fx.statuses.keys()]);
    return fxList.some((fx) => statusList.indexOf(fx) !== -1);
};

export class HMStates {
    static async setStatusEffect(token, id, duration=null) {
        const {actor} = token;
        const {effects} = actor;
        let effect = effects.find((fx) => fx.statuses.has(id));
        if (effect && !duration) return;

        if (!effect) {
            await actor.toggleStatusEffect(id);
            effect = effects.find((fx) => fx.statuses.has(id));
        }

        if (duration) await effect.update({duration, disabled: false});
    }

    static async unsetStatusEffect(token, id) {
        const {actor} = token;
        const effects = actor.effects;
        const effect = effects.find((fx) => fx.statuses.has(id));
        if (effect && !effect.disabled) {
            await effect.update({disabled: true});
            await actor.toggleStatusEffect(id);
        }
    }
}

export class HMActiveEffect extends ActiveEffect {
    onClick() {
        const {disabled} = this;
        this.update({disabled: !disabled});
    }
}

export function applyCustomActiveEffect(mode, actor, modeArgs) {
    const {MODE} = HMCONST.CFX;
    if (Number(mode) === MODE.ABILITY_BONUS) return modeAbilityBonus(actor, modeArgs);
    if (Number(mode) === MODE.GET_PROPERTY) return modeGetProperty(actor, modeArgs);
    return 0;
}

function modeAbilityBonus(actor, [ability, bonus, mode]) {
    const {OPT} = HMCONST.CFX;
    const value = Number(actor.getAbilityBonus(ability, bonus)) || 0;
    if (Number(mode) === OPT.BONUS) return Math.max(0, value);
    if (Number(mode) === OPT.MALUS) return Math.min(0, -value);
    return value;
}

function modeGetProperty(actor, [prop]) {
    return foundry.utils.getProperty(actor, prop) ?? 0;
}
