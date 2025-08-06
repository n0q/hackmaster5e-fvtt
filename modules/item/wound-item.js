import { HMItem } from "./item.js";
import { HMCONST, HMTABLES, SYSTEM_ID } from "../tables/constants.js";
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
     * @param {HMActor} actor - The actor receiving the HMWoundItem.
     * @param {WoundData} wdata - WoundData pertaining to this HMWoundItem.
     */
    static async addWound(_canNotify, actor, wdata) {
        const dialogData = wdata ?? await WoundPrompt.create(undefined, { context: actor });
        if (!dialogData) return;
        const { armorDamage, ...woundData } = HMWoundItem.normalizeWoundData(dialogData);
        if (woundData.hp < 1) return;

        const itemData = {
            name: "Wound",
            type: "wound",
            system: woundData,
            flags: {
                [SYSTEM_ID]: {
                    assn: Number(woundData.assn) || 0,
                    armorDamage: Number(armorDamage) || 0,
                },

            },
        };

        await actor.createEmbeddedDocuments("Item", [itemData]);
    }

    /**
     * Expands missing information on a WoundData object.
     *
     * @param {WoundData} woundData
     * @returns {WoundData}
     */
    static normalizeWoundData(woundData) {
        const { EMBED } = HMCONST.RANGED;
        const normalizedData = foundry.utils.deepClone(woundData);

        normalizedData.timer = woundData.hp;

        if (!woundData.isEmbedded || woundData.embed !== EMBED.AUTO) return normalizedData;
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
