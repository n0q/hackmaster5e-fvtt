import { HMCONST, HMTABLES, SYSTEM_ID } from '../tables/constants.js';
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
        this[SYSTEM_ID] = {talent: deepClone(HMACTOR_TUNABLES)};
        this.resetBonus();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setSkillBonus();
        this.setArmorBonus();
    }

    /** @override */
    // effects need to be applied before the other documents, or their effects will be missed.
    // We're relying on effects to be the first embeddedType. This seems to be safe, but...
    /* eslint-disable no-restricted-syntax */
    prepareEmbeddedDocuments() {
        const embeddedTypes = this.constructor.metadata.embedded || {};
        for (const collectionName of Object.values(embeddedTypes)) {
            for (const e of this[collectionName]) e._safePrepareData();
            if (collectionName === 'effects') this.applyActiveEffects();
        }
    }
    /* eslint-enable no-restricted-syntax */

    get canBackstab() {
        const {cclass} = this.itemTypes;
        if (cclass.length) return cclass[0].system.features.back || false;
        return false;
    }

    get embeddedArrows() {
        const {wound} = this.itemTypes;
        return wound.reduce((acc, w) => acc + 1 * (!!w.system.embed && w.system.isEmbedded), 0);
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
        const topValue = system.bonus.total.trauma ? Math.ceil(max * topCf) : undefined;
        system.hp = {max, value, top: topValue};
    }

    prepareWeaponProfiles() {
        this.wprofiles = new Collection();
        this.itemTypes.weapon.forEach((weapon) => {
            const _id = foundry.utils.randomID();
            weapon.profileId = _id; // eslint-disable-line no-param-reassign
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

/*
    setArmorBonus() {
        const {bonus} = this.system;
        const {shieldItem, armorItem} = this.itemTypes.armor.reduce((acc, obj) => {
            if (obj.system.state !== HMCONST.ITEM_STATE.EQUIPPED) return acc;
            obj.system.isShield ? acc.shieldItem = obj : acc.armorItem = obj;
            return acc;
        }, {shieldItem: undefined, armorItem: undefined});

        if (armorItem) bonus.armor = armorItem.system.bonus.total;
        if (shieldItem) bonus.shield = shieldItem.system.bonus.total;
    }
*/
    /* @todo This function is a hack, until the next bonus refactor replaces everything with
     * a "stats matrix" class.
     */
    setSkillBonus() {
        const {bonus} = this.system;
        const arcanelore = this.itemTypes.skill.find((s) => s.name === 'Arcane Lore');
        if (!arcanelore) return;

        const sfc = arcanelore.system.mastery.value - 1;
        if (sfc > 0) bonus.skill = {sfc};
    }

    setBonusTotal() {
        const {bonus} = this.system;
        const total = {};

        const multiply = ['move'];
        Object.keys(bonus).filter((v) => v !== 'total').forEach((vector) => {
            // Dereference indexed key/val pairs;
            if (bonus[vector]?._idx) {
                const idx = bonus[vector]._idx;
                Object.keys(idx).forEach((idxKey) => {
                    const idxValue = idx[idxKey];
                    const table    = HMTABLES.beast[idxKey][idxValue];
                    bonus[vector]  = Object.assign(bonus[vector], table);
                });
            }

            Object.keys(bonus[vector]).forEach((key) => {
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
            });
        });

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

    async addWound({notify, wdata} = {}) {
        const woundData = wdata ?? (await HMDialogFactory({dialog: 'wound'})).resp;
        const {hp, assn, armorDamage, embed, isEmbedded, note} = woundData;

        if (armorDamage) {
            const armor = this.itemTypes.armor.find((a) => (
                a.system.state === HMCONST.ITEM_STATE.EQUIPPED
                && !a.system.shield.checked
            ));
            if (armor) armor.damageArmorBy(armorDamage);
        }

        if (!hp) return false;

        const data = {hp, timer: hp, embed, isEmbedded, note};
        const itemData = {name: 'Wound', type: 'wound', data};
        const context = await Item.create(itemData, {parent: this});

        if (notify) {
            ui.notifications.info(`<b>${this.name}</b> receives <b>${hp}</b> HP of damage.`);
        }

        const hpToP = this.system.hp.top;
        if (!hpToP || hpToP >= (hp + assn)) return {woundData};

        const cardtype = HMCONST.CARD_TYPE.ALERT;
        const dataset = {context, top: hpToP, wound: hp};
        const cardData = {cardtype, dataset};
        return {woundData, cardData};
    }

    async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
        super.modifyTokenAttribute(attribute, value, isDelta, isBar);
        if (attribute !== 'hp') return;

        const hpCurrent = this.system.hp.value;
        const delta = isDelta ? value : value - hpCurrent;

        if (delta > 0) {
            const wound = this.itemTypes.wound.filter((w) => w.system.hp);
            const woundSum = wound.reduce((acc, x) => x.system.hp + acc, 0);
            let healing = Math.min(delta, woundSum);

            let i = 0;
            while (healing && i < wound.length) {
                const system = wound[i].system;
                if (system.hp) {
                    const limit = Math.sign(--system.hp);
                    system.timer = Math.max(limit, --system.timer);
                    healing--;
                }
                i = ++i % wound.length;
            }

            const newWounds = wound.map((w) => ({_id: w._id, system: w.system}));
            await this.updateEmbeddedDocuments('Item', newWounds);
        } else await this.addWound(-delta);

        this.setHP();
    }
}
