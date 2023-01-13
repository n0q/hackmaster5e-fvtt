/* eslint max-classes-per-file: ['error', 2] */
export const actorHasEffects = (actor, fxList) => {
    const {effects} = actor;
    const actorEffectsList = effects.filter((fx) => !fx.disabled && fx.flags.core)
                                    .map((fx) => fx.flags.core.statusId);
    return actorEffectsList.some((fx) => fxList.indexOf(fx) !== -1);
};

export class HMStates {
    static async setStatusEffect(token, id, duration=null) {
        const {effects} = token.actor;
        let effect = effects.find((x) => x.getFlag('core', 'statusId') === id);
        if (!effect) {
            const idx = CONFIG.statusEffects.findIndex((x) => x.id === id);
            const obj = token.document ? token.document : token;
            await obj.toggleActiveEffect(CONFIG.statusEffects[idx]);
            effect = effects.find((x) => x.getFlag('core', 'statusId') === id);
        }
        if (duration) await effect.update({duration, disabled: false});
    }

    static async unsetStatusEffect(token, id) {
        const effects = token.actor.effects;
        const effect = effects.find((x) => x.getFlag('core', 'statusId') === id);
        if (effect && !effect.disabled) {
            const idx = CONFIG.statusEffects.findIndex((x) => x.id === id);
            await effect.update({disabled: true});
            const obj = token.document ? token.document : token;
            await obj.toggleActiveEffect(CONFIG.statusEffects[idx]);
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

    onClick() {
        const {disabled} = this;
        this.update({disabled: !disabled});
    }
}
