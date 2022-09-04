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

    get canBackstab() {
        const {cclass} = this.itemTypes;
        if (cclass.length) return cclass[0].system.features.back || false;
        return false;
    }

    resetBonus() {
        const {system} = this;
        const {misc} = system.bonus;
        system.bonus = {'total': {}, misc};
    }

    setHP() {
        const {system, type} = this;
        const max = type === 'character' ? system.bonus.total?.hp || 0
                                         : system.hp.max || 0;
        if (max === 0) return;
        let value = max;
        const wounds = this.items.filter((a) => a.type === 'wound');
        Object.keys(wounds).forEach((a) => value -= wounds[a].system.hp);

        const topCf = HMTABLES.top[type] + (system.bonus.total.top || 0);
        const top   = Math.ceil(max * topCf);
        system.hp = {max, value, top};
    }

    setBonusTotal() {
        const {bonus} = this.system;
        const total = {};

        const multiply = ['move'];
        for (const vector in bonus) {
            if (vector === 'total') { continue; }

            // Dereference indexed key/val pairs;
            if (bonus[vector]?._idx) {
                const idx = bonus[vector]._idx;
                for (const idxKey in idx) {
                    const idxValue = idx[idxKey];
                    const table    = HMTABLES[idxKey][idxValue];
                    bonus[vector]  = Object.assign(bonus[vector], table);
                }
            }

            for (const key in bonus[vector]) {
                const value = bonus[vector][key];
                if (key !== '_idx' && value !== null) {
                    if (typeof value === 'string') {
                        total[key] = total?.[key]?.length ? `${total[key]} + ${value}` : value;
                    } else if (multiply.includes(key)) {
                        total[key] = (total?.[key] || 1) * value;
                    } else {
                        total[key] = (total?.[key] || 0) + value;
                    }
                }
            }
        }
        bonus.total = total;
    }

    get drObj() {
        const {bonus} = this.system;
        const shield  = bonus.shield?.dr || 0;
        const armor   = (bonus.total?.dr || 0) - shield;
        return {armor, shield};
    }

    static async createActor(actor, _options, userId) {
        if (game.user.id !== userId) return;
        if (actor.items.size || actor.type === 'beast') { return; }

        const skillPack = game.packs.get('hackmaster5e.uskills');
        const skillIndex = await skillPack.getIndex();
        const itemList = [];

        /* eslint no-await-in-loop: 0 */
        for (const idx of skillIndex) {
            const skill = await skillPack.getDocument(idx._id);
            const translated = game.i18n.localize(skill.name);
            if (translated !== '') { skill.name = translated; }
            itemList.push(skill);
        }

        const innatePack = game.packs.get('hackmaster5e.hmbinnate');
        const innateIndex = await innatePack.getIndex();
        const id = innateIndex.getName('Unarmed')._id;
        const unarmed = await innatePack.getDocument(id);
        itemList.push(unarmed);

        await actor.createEmbeddedDocuments('Item', itemList);
    }

    // Populate hp.max for beast tokens.
    static async createToken(token, _options, userId) {
        if (game.user.id !== userId) return;
        const {actor} = token;
        if (actor.type !== 'beast' || actor.system.hp.max || userId !== game.user.id) return;

        const {hp} = actor.system;
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
