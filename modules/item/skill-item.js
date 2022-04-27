import { HMItem } from './item.js';

export class HMSkillItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.actor?.data) return;

        const actorData = this.actor.data;
        const {bonus, relevant, universal} = this.data.data;

        if (this.actor.type === 'character') {
            if (universal && !bonus.mastery.value) {
                const abilities = actorData.data.abilities.total;
                const stack = [];

                for (const key in relevant) {
                    if (relevant[key]) { stack.push(abilities[key].value); }
                }
                const value = Math.min(...stack);
                bonus.stats = {value, 'literacy': value, 'verbal': value};
            } else { delete bonus.stats; }
        }

        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += (bonus[state][key] || 0); }
            bonus.total[key] = sum;
        }
    }
}
