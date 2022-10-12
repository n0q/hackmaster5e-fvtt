/* eslint max-classes-per-file: ['error', 2] */
import { HMTABLES } from './constants.js';

export class HMStates {
    static async setStatusEffect(token, id, duration=null) {
        const effects = token.actor.effects;
        let effect = effects.find((x) => x.getFlag('core', 'statusId') === id);
        if (!effect) {
            const idx = CONFIG.statusEffects.findIndex((x) => x.id === id);
            await token.toggleActiveEffect(CONFIG.statusEffects[idx]);
            effect = effects.find((x) => x.getFlag('core', 'statusId') === id);
        }
        if (duration) await effect.update({duration, disabled: false});
    }

    static async setupStatusEffects() {
        const {statusEffects} = HMTABLES.effects;
        Object.keys(statusEffects).forEach((key) => {
            const effect = statusEffects[key];
            effect.id = key;
            CONFIG.statusEffects.push(effect);
        });
    }

    static async unsetStatusEffect(token, id) {
        const effects = token.actor.effects;
        const effect = effects.find((x) => x.getFlag('core', 'statusId') === id);
        if (effect && !effect.disabled) {
            const idx = CONFIG.statusEffects.findIndex((x) => x.id === id);
            await effect.update({disabled: true});
            await token.toggleActiveEffect(CONFIG.statusEffects[idx]);
        }
    }
}

export class HMActiveEffect extends ActiveEffect {
    _prepareDuration() {
        const d = super._prepareDuration();
        if (d.type === 'turns' || d.type === 'rounds') {
            const remainingRounds = Math.floor(d.remaining);
            d.remaining = remainingRounds;
            d.label = this._getDurationLabel(remainingRounds);
            d.type = 'rounds';
        }
        return d;
    }

    static async applyActiveEffect(actor, change, current, mdelta, changes) {
        const delta = HMTABLES.c_effect[mdelta](actor);
        const update = current + delta;
        changes[change.key] = update; // eslint-disable-line
    }

    // Enforces exclusivity if effects are manually set by the user.
    static async createActiveEffect(obj) {
        const {statusId} = obj.flags.core;
        const exclusiveEffects = [...HMTABLES.effects.exclusiveEffects];
        const idx = exclusiveEffects.indexOf(statusId);
        if (idx !== -1) {
            exclusiveEffects.splice(idx, 1);
            const token = await obj.parent.getTokenDocument();
            exclusiveEffects.forEach((effect) => HMStates.unsetStatusEffect(token, effect));
        }
    }
}
