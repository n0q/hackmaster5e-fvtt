import { HMTABLES } from '../sys/constants.js';

export class HMActor extends Actor {
    prepareBaseData() {
        super.prepareBaseData();
        this.resetBonus();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setHP();
    }

    resetBonus() {
        const {data} = this.data;
        const {misc} = data.bonus;
        data.bonus   = {'total': {}, misc};
    }

    async setRace() {
        const {data} = this.data;
        const races = this.items.filter((a) => a.type === 'race');
        if (!races.length) return;
        const race = races.pop();

        data.bonus.race     = race.data.data.bonus;
        data.abilities.race = race.data.data.abilities;

        if (races.length) {
            let oldrace;
            while (oldrace = races.pop()) await oldrace.delete();
        }
    }

    async setCClass() {
        const {data} = this.data;
        const cclasses = this.items.filter((a) => a.type === 'cclass');
        if (!cclasses.length) return;

        const cclass = cclasses.pop();
        data.bonus.class = cclass.data.data.bonus;

        if (cclasses.length) {
            let oldclass;
            while (oldclass = cclasses.pop()) await oldclass.delete();
        }
    }

    setHP() {
        const {data, type} = this.data;
        const max = type === 'character' ? data.bonus.total?.hp || 0
                                         : data.hp.max || 0;
        if (max === 0) { return; }

        let value = max;
        const wounds = this.items.filter((a) => a.type === 'wound');
        Object.keys(wounds).forEach((a) => value -= wounds[a].data.data.hp);

        const topCf = HMTABLES.top[type] + (data.bonus.total.top || 0);
        const top   = Math.ceil(max * topCf);
        data.hp = {max, value, top};
    }

    setBonusTotal() {
        const {bonus} = this.data.data;
        const total = {};

        for (const vector in bonus) {
            if (vector === 'total') { continue; }

            // Dereference indexed key/val pairs;
            if (bonus[vector]?._idx) {
                const idx = bonus[vector]._idx;
                for (const idxKey in idx) {
                    const idxValue = idx[idxKey];
                    const table    = HMTABLES[idxKey][idxValue];
                    bonus[vector]     = Object.assign(bonus[vector], table);
                }
            }

            for (const key in bonus[vector]) {
                const value = bonus[vector][key];
                if (key !== '_idx' && value !== null) {
                    total[key] = (total?.[key] || 0) + value;
                }
            }
        }
        bonus.total = total;
    }

    get drObj() {
        const {bonus} = this.data.data;
        const shield  = bonus.shield?.dr || 0;
        const armor   = (bonus.total?.dr || 0) - shield;
        return {armor, shield};
    }

    static async createActor(actor) {
        if (actor.items.size || actor.data.type === 'beast') { return; }

        const skillPack = game.packs.get('hackmaster5e.uskills');
        const skillIndex = await skillPack.getIndex();
        const uskills = [];

        for (const idx of skillIndex) {
            const skill = await skillPack.getDocument(idx._id);
            const translated = game.i18n.localize(skill.data.name);
            if (translated !== '') { skill.data.name = translated; }
            uskills.push(skill.data);
        }
        await actor.createEmbeddedDocuments('Item', uskills);
    }

    // Populate hp.max for beast tokens.
    static async createToken(token, _options, userId) {
        const {actor} = token;
        if (actor.type !== 'beast'
            || actor.data.data.hp.max
            || userId !== game.user.id) { return; }

        const {hp} = actor.data.data;
        const {formula} = hp;
        if (Roll.validate(formula)) {
            const r = new Roll(formula);
            await r.evaluate({'async': true});
            hp.value = r.total;
            hp.max = r.total;
            await actor.update({'data.hp': hp});
        }
    }
}
