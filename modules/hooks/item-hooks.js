import { HMCONST } from "../tables/constants.js";
import { HMContainer } from "../item/container.js";

export class HMItemHooks {
    static createItem(item, options, userId) {
        if (game.user.id !== userId) return;
        if (!item.parent) return;
        const { type } = item;

        const { keepId } = options;
        if (type === "wound") item.parent._onWound(item);
        if (type === "item" && item.system.container.enabled && !keepId) {
            HMContainer.randomizeChildIDs(item);
        }

        if (type === "race" || type === "cclass") {
            const itemList = item.parent.itemTypes[type];
            if (!itemList.length) return;

            Object.entries(itemList.slice(0, itemList.length - 1))
                .map(a => item.parent.items.get(a[1].id).delete());
        }
    }

    static preCreateItem(item, data, _opt, userId) {
        if (game.user.id !== userId || !item.parent) return true;
        if (data.type === "talent") {
            if (item.parent.type !== "character") {
                const msg = game.i18n.localize("HM.NOTIFY.talentCharOnly");
                ui.notifications.error(msg);
                return false;
            }

            if (Number(data.system.type) === HMCONST.TALENT.WEAPON) {
                const actor = item.parent;
                const dupes = actor.itemTypes.talent.find(a => a.name === data.name);
                return !dupes;
            }
        }
        return true;
    }

    static updateItem(...args) {
        const item = args[0];
        if (item.type !== "weapon" || !item.actor) return;
        item.actor.getActiveTokens().forEach(x => x.drawReach());
    }
}
