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
        const {statusEffects} = HMTABLES;
        Object.keys(statusEffects).forEach((key) => {
            const effect = statusEffects[key];
            effect.id = key;
            CONFIG.statusEffects.push(effect);
        });
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
}
