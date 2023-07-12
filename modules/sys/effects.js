import { SYSTEM_ID } from '../tables/constants.js';

/* eslint max-classes-per-file: ['error', 2] */
export const actorHasEffects = (actor, statusList) => {
    const effects = actor.effects.filter((fx) => !fx.disabled);
    const fxList = effects.flatMap((fx) => [...fx.statuses.keys()]);
    return fxList.some((fx) => statusList.indexOf(fx) !== -1);
};

export class HMStates {
    static async setStatusEffect(token, id, duration=null) {
        const {effects} = token.actor;
        let effect = effects.find((fx) => fx.statuses.has(id));
        if (effect && !duration) return;

        if (!effect) {
            const idx = CONFIG.statusEffects.findIndex((x) => x.id === id);
            const obj = token.document ? token.document : token;
            await obj.toggleActiveEffect(CONFIG.statusEffects[idx]);
            effect = effects.find((fx) => fx.statuses.has(id));
        }

        if (duration) await effect.update({duration, disabled: false});
    }

    static async unsetStatusEffect(token, id) {
        const effects = token.actor.effects;
        const effect = effects.find((fx) => fx.statuses.has(id));
        if (effect && !effect.disabled) {
            const idx = CONFIG.statusEffects.findIndex((x) => x.id === id);
            await effect.update({disabled: true});
            const obj = token.document ? token.document : token;
            await obj.toggleActiveEffect(CONFIG.statusEffects[idx]);
        }
    }
}

export class HMActiveEffect extends ActiveEffect {
    onClick() {
        const {disabled} = this;
        this.update({disabled: !disabled});
    }

    _applyCustom(...args) {
        super._applyCustom(...args);
        const changes = args[4];
        const [customChanges] = Object.values(changes);
        this[SYSTEM_ID] = {customChanges};
    }
}
