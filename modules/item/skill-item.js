import { HMItem } from './item.js';

export class HMSkillItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor) return;

        const actorData = this.actor.system;
        const {bonus, relevant, universal} = this.system;

        if (this.actor.type === 'character') {
            const abilities = actorData.abilities.total;

            // It's not clear why this third term is needed, now.
            // Sometimes actgorData.abilities.total is null.
            // TODO: Fix this properly.
            if (universal && !bonus.mastery.value && abilities) {
                const stack = [];
                for (const key in relevant) {
                    if (relevant[key]) stack.push(abilities[key].value);
                }
                const value = Math.min(...stack);
                bonus.stats = {value, 'literacy': value, 'verbal': value};
            } else { delete bonus.stats; }
        }

        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += (bonus[state][key] || 0); }
            bonus.total[key] = sum + (actorData.bonus?.state?.skills || 0);
        }
    }
}
