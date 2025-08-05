import { HMItem } from "./item.js";
import { HMCONST, HMTABLES } from "../tables/constants.js";
import { WoundPrompt } from "../apps/wound-application.js";

/**
 * @typedef {Object} WoundData
 * @property {number} hp
 * @property {number} assn
 * @property {number} armorDamage
 * @property {enum} embed
 * @property {boolean} isEmbedded
 * @property {string} note
 */

export class HMWoundItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    onClick(ev) {
        this.WoundAction(ev);
    }

    /**
     *
     * @param {boolean} canNotify - If we should create a notification about this HMWoundItem.
     * @param {HMActor} context - The actor receiving the HMWoundItem.
     * @param {WoundData} wdata - WoundData pertaining to this HMWoundItem.
     */
    static async addWound(canNotify, context, wdata) {
        const receivedData = wdata ?? await WoundPrompt.create(undefined, { context });
        const woundData = HMWoundItem.normalizeWoundData(receivedData);
        const { hp, assn, armorDamage, embed, isEmbedded, note } = woundData;

        if (armorDamage) {
            const armor = context.itemTypes.armor.find(a => (
                a.system.state === HMCONST.ITEM_STATE.EQUIPPED
                && !a.system.isShield
            ));
            if (armor) armor.damageArmorBy(armorDamage);
        }

        if (!hp) return;

        const system = { hp, timer: hp, embed, isEmbedded, note };
        const itemData = { name: "Wound", type: "wound", system };
        await Item.create(itemData, { parent: context });

        if (canNotify) {
            const formatData = { name: context.name, hp };
            const uiString = game.i18n.format("HM.UI.WOUND.notify", formatData);
            ui.notifications.info(uiString);
        }

        const hpTrauma = context.system.hp.top;
        const hpTenacity = context.system.hp.tenacity;
        const traumaCheck = hpTrauma < (hp + assn);
        const tenacityCheck = hpTenacity < hp;

        await context.onWound(traumaCheck, tenacityCheck);
    }

    /**
     * Expands missing information on a WoundData object.
     *
     * @param {WoundData} woundData
     * @returns {WoundData}
     */
    static normalizeWoundData(woundData) {
        if (!woundData.isEmbedded) return woundData;
        if (woundData.embed !== HMCONST.RANGED.EMBED.AUTO) return woundData;
        const normalizedData = foundry.utils.deepClone(woundData);
        normalizedData.embed = HMTABLES.weapons.ranged.embed(woundData.hp);
        return normalizedData;
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const { action } = element.dataset;
        let { hp, isEmbedded, timer, treated } = this.system;

        switch (action) {
            case "decTimer": {
                timer--;
                if (!timer && hp) timer = --hp;
                treated = true;
                break;
            }
            case "decHp": {
                hp = Math.max(0, hp - 1);
                const limit = Math.sign(hp);
                timer = Math.max(limit, --timer);
                treated = true;
                break;
            }
            case "treat": {
                treated = !treated;
                break;
            }
            case "toggleEmbed": {
                isEmbedded = !isEmbedded;
                treated = true;
            }
            // no default
        }

        if (hp < 1) [hp, timer] = [0, 0];

        const updateData = {
            "system.hp": hp,
            "system.isEmbedded": isEmbedded,
            "system.timer": timer,
            "system.treated": treated,
        };

        hp < 1 && !isEmbedded
            ? await this.delete()
            : await this.update(updateData);
    }
}
