import { HMTABLES, SYSTEM_ID } from '../tables/constants.js';
import { HMACTOR_TUNABLES } from '../tables/tunables.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMWeaponProfile } from '../item/weapon-profile.js';
import { HMItemContainer } from './container-abstract.js';

export class HMActor extends Actor {
    constructor(...args) {
        super(...args);
        this.hm = new HMItemContainer({actor: this});
    }

    prepareBaseData() {
        super.prepareBaseData();
        if (this.type === 'worksheet') return;
        this[SYSTEM_ID] = {talent: deepClone(HMACTOR_TUNABLES)};
        this.resetBonus();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setArmorBonus();
    }

    /** @override */
    // effects need to be applied before the other documents, or their effects will be missed.
    // We're relying on effects to be the first embeddedType. This seems to be safe, but...
    prepareEmbeddedDocuments() {
        const embeddedTypes = this.constructor.metadata.embedded || {};
        for (const collectionName of Object.values(embeddedTypes)) {
            for (const e of this[collectionName]) e._safePrepareData();
            if (collectionName === 'effects') this.applyActiveEffects();
        }
    }

    get canBackstab() {
        const {cclass} = this.itemTypes;
        if (cclass.length) return cclass[0].system.features.back || false;
        return false;
    }

    get fightingDefensively() {
        const fxList = this.effects.contents.flatMap((fx) => [...fx.statuses.keys()]);
        const dSet = new Set(Object.values(HMTABLES.effects.defense));
        return fxList.some((fx) => dSet.has(fx));
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
        Object.keys(wounds).forEach((a) => { value -= wounds[a].system.hp; });

        const topCf = HMTABLES.top[type] + (system.bonus.total.top || 0);
        const topValue = Math.floor(max * topCf);
        system.hp = {max, value, top: topValue};
    }

    prepareWeaponProfiles() {
        this.wprofiles = new Collection();
        this.itemTypes.weapon.forEach((weapon) => {
            const _id = foundry.utils.randomID();
            weapon.profileId = _id;
            const profileData = {name: weapon.name, weapon, actor: this, _id};
            const profile = new HMWeaponProfile(profileData);
            profile.evaluate();
            this.wprofiles.set(profile.id, profile);
        });
    }

    setArmorBonus() {
        const {bonus} = this.system;
        const allArmor = this.itemTypes.armor.filter((a) => a.invstate === 'equipped');

        const isShield = (a) => a.system.shield.checked;
        const shieldItem = allArmor.find(isShield);
        const armorItem = allArmor.find((a) => !isShield(a));

        if (armorItem) bonus.armor = armorItem.system.bonus.total;
        if (shieldItem) bonus.shield = shieldItem.system.bonus.total;
    }

    setBonusTotal() {
        const {bonus} = this.system;
        const total = {};

        const multiply = ['move'];
        for (const vector in bonus) {
            if (vector === 'total') continue;

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

        Object.keys(total)
            .filter((stat) => Number.isNumeric(total[stat]) && !Number.isInteger(total[stat]))
            .forEach((stat) => {
                const parsed = parseFloat(total[stat]);
                total[stat] = parseFloat(parsed.toPrecision(5));
            });

        bonus.total = total;
    }

    get drObj() {
        const {bonus} = this.system;
        const shield  = bonus.shield?.dr || 0;
        const armor   = (bonus.total?.dr || 0) - shield;
        return {armor, shield};
    }

    getAbilityBonus() {
        const cName = this.constructor.name;
        console.error(`${cName} does not have a getAbilityBonus() function.`);
    }

    async addWound(amount, topIgnore=0) {
        let woundData = {hp: amount, timer: amount, assn: topIgnore};

        if (!amount) {
            const dataset = {dialog: 'wound'};
            const dialogResp = await HMDialogFactory(dataset);
            woundData = dialogResp.data;
        }

        const {hp, assn} = woundData;
        if (hp < 1) return {hp: 0};
        const iData = {name: 'New Wound', type: 'wound', data: woundData};

        try {
            await Item.create(iData, {parent: this});
        } catch (error) {
            return {error, hp};
        }

        return {hp, assn};
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
