import { HMTABLES } from '../sys/constants.js';
import { HMDialogMgr } from '../mgr/dialogmgr.js';

export class HMActor extends Actor {
    prepareBaseData() {
        super.prepareBaseData();
        this.resetBonus();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setHP();
    }

    /** @override */
    // effects need to be applied before the other documents, or their effects will be missed.
    // We're relying on effects to be the first embeddedType. This seems to be safe, but...
    prepareEmbeddedDocuments() {
        const embeddedTypes = this.constructor.metadata.embedded || {};
        for (const collectionName of Object.values(embeddedTypes)) {
            for (let e of this[collectionName]) e._safePrepareData();
            if (collectionName == 'effects') this.applyActiveEffects();
        }
    }

    get canBackstab() {
        const {cclass} = this.itemTypes;
        if (cclass.length) return cclass[0].system.features.back || false;
        return false;
    }

    get fightingDefensively() {
        const fxList = this.effects.map((fx) => fx.getFlag('core', 'statusId'));
        const dList = Object.values(HMTABLES.effects.defense);
        return fxList.map((x) => dList.indexOf(x) >= 0).some((y) => y);
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
        const top   = Math.floor(max * topCf);
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

    getAbilityBonus() {
        const cName = this.constructor.name;
        console.error(`${cName} does not have a getAbilityBonus() function.`);
    }

    async addWound(amount) {
        let woundData = {hp: amount, timer: amount};

        if (!amount) {
            const dataset = {dialog: 'wound'};
            const dialogMgr = new HMDialogMgr();
            const dialogResp = await dialogMgr.getDialog(dataset);
            woundData = dialogResp.data;
        }

        const {hp} = woundData;
        if (hp < 1) return {hp: 0};
        const iData = {name: 'New Wound', type: 'wound', data: woundData};

        try {
            await Item.create(iData, {parent: this});
        } catch (error) {
            return {error, hp};
        }

        return {hp};
    }

    async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
        super.modifyTokenAttribute(attribute, value, isDelta, isBar);
        if (attribute !== 'hp') return;

        const hpCurrent = this.system.hp.value;
        const delta = isDelta ? value : value - hpCurrent;

        if (delta > 0) {
            const wounds = this.itemTypes.wound.filter((a) => a.system.hp > 0);
            const woundsTotal = wounds.reduce((acc, x) => x.system.hp + acc, 0);
            const healMax = Math.min(delta, woundsTotal);

            let healedTotal = 0;
            let r = wounds.length * healMax;
            const healValues = new Array(wounds.length).fill(0);
            for (let i = 0; healedTotal < healMax; i = ++i % wounds.length) {
                if (!r--) break;
                if (healValues[i] < wounds[i].system.hp) {
                    healValues[i]++;
                    healedTotal++;
                }
            }
            for (let i = 0; i < wounds.length; i++) await wounds[i].setHp({value: -healValues[i]});
        } else await this.addWound(-delta);

        this.setHP();
    }
}
