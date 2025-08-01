import { HMCONST, HMTABLES, SYSTEM_ID } from '../tables/constants.js';
import { HMACTOR_TUNABLES } from '../tables/tunables.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMWeaponProfile } from '../item/weapon-profile.js';
import { HMItemContainer } from './container-abstract.js';
import { HMChatFactory, CHAT_TYPE } from '../chat/chat-factory.js';
import { getDiceSum } from '../sys/utils.js';

export class HMActor extends Actor {
    constructor(...args) {
        super(...args);
        this.hm = new HMItemContainer({actor: this.uuid});
    }

    prepareBaseData() {
        super.prepareBaseData();
        this[SYSTEM_ID] = {talent: foundry.utils.deepClone(HMACTOR_TUNABLES)};
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

        // HACK: Workaround to avoid temporal couple between setBonusTotal() and setHP().
        // setHP() directly modifies bonus, here. Bad craziness.
        // TODO: Create a bonus state object before this becomes as bad as the old chatmgr.
        const ff = HMTABLES.fatigue.wound({value, max}) || 0;
        system.bonus.hp = {ff};
        system.bonus.total.ff += ff;
    }

    prepareWeaponProfiles() {
        this.wprofiles = new Collection();
        this.itemTypes.weapon.forEach((weapon) => {
            const profileData = {weapon, actor: this};
            const profile = new HMWeaponProfile(profileData);
            profile.evaluate();
            this.wprofiles.set(profile.id, profile);
        });
    }

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

    async onWound(traumaCheck, tenacityCheck, options) {
        const bData = {caller: this.uuid};
        const builder = await HMChatFactory.create(CHAT_TYPE.ALERT_NOTE, bData, options);
        const ALERT_TYPE = builder.ALERT_TYPE;

        if (traumaCheck) {
            builder.update('mdata', {type: ALERT_TYPE.TRAUMA});
            builder.createChatMessage();
        }

        if (tenacityCheck) {
            builder.update('mdata', {type: ALERT_TYPE.TENACITY});
            builder.createChatMessage();
        }
    }

    /**
     * Performs a roll save based on the provided dataset. If the roll type is 'trauma',
     * it applies additional trauma rules.
     * NOTE: Desperate need of refactor once mgr/chatmgr.js is gone.
     *
     * @async
     * @param {Object} dataset - The dataset containing necessary information for the roll.
     * @param {stgring} dataset.dialog - The dialog type for the roll.
     * @param {string} dataset.formulaType - The formula type for the roll (e.g., 'trauma').
     * @param {Object} [dataset.bData] - Optional base data for the roll.
     * @returns {Promise<void>}
     */
    async rollSave(dataset) {
        const {dialog, formulaType, mdata} = dataset;
        const chatType = formulaType === 'trauma' ? CHAT_TYPE.TRAUMA_CHECK : CHAT_TYPE.SAVE_CHECK;
        let bData = {...dataset};
        if (!bData.resp) bData = {...bData, ...(await HMDialogFactory({...dataset}, this))};

        bData.caller = bData.caller.uuid;
        bData.context = bData.context.uuid;
        bData.mdata = {formulaType};

        const formula = HMTABLES.formula[dialog][formulaType];
        const rollContext = {
            ...this.system,
            resp: bData.resp,
            talent: this.hackmaster5e.talent,
        };

        const roll = await new Roll(formula, rollContext).evaluate();
        if (chatType === CHAT_TYPE.TRAUMA_CHECK) bData = await getTraumaBData(roll, bData);
        bData.roll = roll.toJSON();

        foundry.utils.mergeObject(bData.mdata, mdata);
        const builder = await HMChatFactory.create(chatType, bData);
        await builder.createChatMessage();
    }

    /**
     * Modifies a token attribute, with special handling for HP changes.
     *
     * @param {string} attribute - The attribute being modified (e.g., "hp").
     * @param {number} value - The new value or delta to apply.
     * @param {boolean} [isDelta=false] - If value is a delta (true) or an abs value (false).
     * @param {boolean} [isBar=true] - Whether the change originated from the token bar UI.
     * @returns {Promise<void>}
     */
    async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
        if (attribute !== 'hp') {
            super.modifyTokenAttribute(attribute, value, isDelta, isBar);
            return;
        }

        const hpCurrent = this.system.hp.value;
        const hpDelta = isDelta ? value : value - hpCurrent;

        if (!hpDelta) return;

        hpDelta > 0
            ? await this.healWounds(hpDelta)
            : await this.addWound(true, {hp: -hpDelta});

        this.setHP();
    }

    /**
     * Distributes a specified amount of healing among the actor's wounds in a round-robin fashion.
     * Each point of healing reduces a wound's hp by 1 and decrements its timer.
     * Wounds reduced to 0 hp are deleted, unless they have a note attached.
     *
     * @param {number} healingRequested - The total amount of healing to distribute among wounds.
     * @returns {Promise<void>} Resolves when all updates and deletions are complete.
     */
    async healWounds(healingRequested) {
        const wounds = this.itemTypes.wound.filter((w) => w.system.hp);
        const healingMaximum = wounds.reduce((acc, x) => x.system.hp + acc, 0);
        const woundsData = wounds.map((w) => ({
            _id: w.id,
            hp: w.system.hp,
            note: w.system.note,
            timer: w.system.timer,
            treated: w.system.treated,
        }));

        let healingLeft = Math.min(healingRequested, healingMaximum);

        // Round robin healing.
        while (healingLeft > 0) {
            let healedThisPass = false;

            // eslint-disable-next-line no-restricted-syntax
            for (const wound of woundsData) {
                if (wound.hp > 0 && healingLeft > 0) {
                    wound.hp--;
                    wound.timer = Math.max(1, --wound.timer);
                    if (!wound.treated) wound.treated = true;
                    healingLeft--;
                    healedThisPass = true;
                }
            }
            if (!healedThisPass) break;
        }

        const woundsToUpdate = woundsData.filter((w) => w.hp > 0);

        // Only delete wounds with 0 hp and no annotation.
        const woundsToDelete = woundsData
            .filter((w) => w.hp === 0 && typeof w.note === 'undefined')
            .map((w) => w._id);

        const woundsUpdate = woundsToUpdate.map((w) => ({
            _id: w._id,
            'system.hp': w.hp,
            'system.timer': w.timer,
            'system.treated': w.treated,
        }));

        await Promise.all([
            woundsUpdate.length && this.updateEmbeddedDocuments('Item', woundsUpdate),
            woundsToDelete.length && this.deleteEmbeddedDocuments('Item', woundsToDelete),
        ]);
    }
}

/**
 * Processes trauma-specific logic based on the initial roll data.
 * Evaluates additional rolls for coma and KO duration as needed.
 *
 * @param {Object} bData - The base data from the initial roll.
 * @param {Roll} roll = The initial roll result.
 * @param {Array|Object} bData.batch - An array to store additional roll results.
 * @returns {Promise<Object>} - Resolves to the updated bData object.
 * @async
 */
async function getTraumaBData(roll, bData) {
    const traumaData = bData;
    const failType = HMCONST.TRAUMA_FAILSTATE;

    let failState = failType.PASSED;
    const batch = [roll];

    if (roll.total <= 0) return {...traumaData, batch: [roll.toJSON()], mdata: {failState}};

    // Extended Trauma rules.
    failState = failType.FAILED;
    if (getDiceSum(roll) > 19) {
        failState = failType.KO;

        const {comaCheck, comaDuration, koDuration} = HMTABLES.formula.trauma;
        const comaCheckRoll = await new Roll(comaCheck).evaluate();
        batch.push(comaCheckRoll);

        // Coma check
        if (comaCheckRoll.total > 19) failState = failType.COMA;

        const durationFormula = failState === failType.COMA ? comaDuration : koDuration;
        const durationRoll = await new Roll(durationFormula).evaluate();

        if (failState === failType.COMA && durationRoll.total > 19) {
            failState = failType.VEGETABLE;
        }

        batch.push(durationRoll);
    }
    traumaData.batch = batch.map((r) => r.toJSON());
    traumaData.mdata = {failState};
    return traumaData;
}
