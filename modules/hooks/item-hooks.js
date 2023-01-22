import { HMCONST, HMTABLES } from '../tables/constants.js';
import { HMChatMgr } from '../mgr/chatmgr.js';

export class HMItemHooks {
    static async createItem(item, _options, userId) {
        if (game.user.id !== userId) return;
        if (!item.parent) return;
        const {type} = item;

        if (type === 'wound' && item.parent) {
            if (!item.parent.system.bonus.total.trauma) return;
            const hpToP = item.parent.system.hp.top;

            const {assn, hp} = item.system;
            if (!hpToP || hpToP >= hp + assn) return;

            const chatmgr = new HMChatMgr();
            const cardtype = HMCONST.CARD_TYPE.ALERT;
            const dataset = {context: item, top:hpToP, wound: hp};
            if (item.parent.type === 'beast') dataset.hidden = true;
            const card = await chatmgr.getCard({cardtype, dataset});
            await ChatMessage.create(card);

            // Auto-roll for beasts.
            if (item.parent.type === 'beast') {
                const formula = HMTABLES.formula.save.trauma;
                const dialogResp = {caller: item.parent, context: item.parent};
                const {system, hackmaster5e} = item.parent;

                const rollContext = {...system, talent: hackmaster5e.talent};
                const roll = await new Roll(formula, rollContext).evaluate({async: true});

                dataset.resp = {caller: item.parent};
                dataset.dialog = 'save';
                dataset.formulaType = 'trauma';

                dialogResp.resp = {rollMode: 'gmroll'};
                const topcard = await chatmgr.getCard({dataset, roll, dialogResp});
                await ChatMessage.create(topcard);
            }
        } else if (type === 'race' || type === 'cclass') {
            const itemList = item.parent.itemTypes[type];
            if (!itemList.length) return;

            Object.entries(itemList.slice(0, itemList.length -1))
                .map((a) => item.parent.items.get(a[1].id).delete());
        }
    }

    static preCreateItem(item, data, _opt, userId) {
        if (game.user.id !== userId || !item.parent) return true;
        if (data.type === 'talent') {
            if (item.parent.type !== 'character') {
                const msg = game.i18n.localize('HM.NOTIFY.talentCharOnly');
                ui.notifications.error(msg);
                return false;
            }

            if (Number(data.system.type) === HMCONST.TALENT.WEAPON) {
                const actor = item.parent;
                const dupes = actor.itemTypes.talent.find((a) => a.name === data.name);
                return !dupes;
            }
        }
        return true;
    }

    static updateItem(...args) {
        const item = args[0];
        if (item.type !== 'weapon' || !item.actor) return;
        item.actor.getActiveTokens().forEach((x) => x.drawReach());
    }
}
