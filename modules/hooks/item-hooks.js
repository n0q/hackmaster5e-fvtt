import { HMCONST, HMTABLES } from '../tables/constants.js';
import { HMChatMgr } from '../mgr/chatmgr.js';

export class HMItemHooks {
    static async createItem(item, _options, userId) {
        if (game.user.id !== userId) return;
        const {parent, type} = item;

        if (type === 'wound' && parent) {
            if (!parent.system.bonus.total.trauma) return;
            const {top} = parent.system.hp;
            const wound = item.system.hp;
            if (!top || top >= wound) return;

            const chatmgr = new HMChatMgr();
            const cardtype = HMCONST.CARD_TYPE.ALERT;
            const dataset = {context: item, top, wound};
            if (parent.type === 'beast') dataset.hidden = true;
            const card = await chatmgr.getCard({cardtype, dataset});
            await ChatMessage.create(card);

            // Auto-roll for beasts.
            if (parent.type === 'beast') {
                const formula = HMTABLES.formula.save.trauma;
                const dialogResp = {caller: parent, context: parent};
                const roll = await new Roll(formula, parent.system).evaluate({async: true});
                dataset.resp = {caller: parent};
                dataset.dialog = 'save';
                dataset.formulaType = 'trauma';

                dialogResp.resp = {rollMode: 'gmroll'};
                const topcard = await chatmgr.getCard({dataset, roll, dialogResp});
                await ChatMessage.create(topcard);
            }
        } else if (type === 'race' || type === 'cclass') {
            const itemList = parent.itemTypes[type];
            if (!itemList.length) return;

            Object.entries(itemList.slice(0, itemList.length -1))
                .map((a) => parent.items.get(a[1].id).delete());
        }
    }

    static preCreateItem(item, data, _opt, userId) {
        if (game.user.id !== userId || !item.parent) return true;
        if (data.type === 'talent' && data.system.type === HMCONST.TALENT.WEAPON) {
            const actor = item.parent;
            const dupes = actor.itemTypes.talent.find((a) => a.name === data.name);
            return !dupes;
        }
        return true;
    }
}
