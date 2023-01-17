import { HMCONST, HMTABLES } from '../tables/constants.js';
import { HMStates } from '../sys/effects.js';
import { HMSocket, SOCKET_TYPES } from '../sys/sockets.js';

export class HMActiveEffectHooks {
    static setupStatusEffects() {
        const {statusEffects} = HMTABLES.effects;
        Object.keys(statusEffects).forEach((key) => {
            const effect = statusEffects[key];
            effect.id = key;
            CONFIG.statusEffects.push(effect);
        });
    }

    static async applyActiveEffect(actor, change, current, metadata, changes) {
        const [mode, ...modeArgs] = metadata.split(',');
        const delta = applyCustomActiveEffect(mode, actor, modeArgs);
        const update = current + delta;
        changes[change.key] = update; // eslint-disable-line
    }

    static createActiveEffect(effect, _data, userId) {
        if (game.userId !== userId) return;
        if (!effect.flags.core) return;

        // Enforces exclusivity if status effects are manually set by the user.
        const {statusId} = effect.flags.core;
        const token = effect.parent.getActiveTokens().shift();
        const exclusiveEffects = [...HMTABLES.effects.exclusiveEffects];
        const idx = exclusiveEffects.indexOf(statusId);
        if (idx !== -1) {
            exclusiveEffects.splice(idx, 1);
            exclusiveEffects.forEach((fx) => HMStates.unsetStatusEffect(token, fx));
        }

        token.drawReach();
        HMSocket.emit(SOCKET_TYPES.DRAW_REACH, token.id);
    }

    static deleteActiveEffect(effect, _data, userId) {
        if (game.userId !== userId) return;
        if (!effect.flags.core) return;

        const token = effect.parent.getActiveTokens().shift();
        token.drawReach();
        HMSocket.emit(SOCKET_TYPES.DRAW_REACH, token.id);
    }
}

function applyCustomActiveEffect(mode, actor, modeArgs) {
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
