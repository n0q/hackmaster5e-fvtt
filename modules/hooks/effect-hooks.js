import { HMTABLES } from '../tables/constants.js';
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

    static async applyActiveEffect(actor, change, current, mdelta, changes) {
        const delta = HMTABLES.c_effect[mdelta](actor);
        const update = current + delta;
        changes[change.key] = update; // eslint-disable-line
    }

    static createActiveEffect(effect, _data, userId) {
        if (game.userId !== userId) return;
        if (effect.parent.type === 'talent') {
            console.warn('hello');
            console.warn(effect);
            return;
        }

        // Enforces exclusivity if effects are manually set by the user.
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

        const token = effect.parent.getActiveTokens().shift();
        token.drawReach();
        HMSocket.emit(SOCKET_TYPES.DRAW_REACH, token.id);
    }
}
