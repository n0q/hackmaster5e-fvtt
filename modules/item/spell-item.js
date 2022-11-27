import { HMItem, advanceClock, setStatusEffectOnToken } from './item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMTABLES } from '../sys/constants.js';

export class HMSpellItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    static async rollSpell({spell, caller}={}) {
        let actor;
        let token;
        if (!caller) {
            [token] = canvas.tokens.controlled;
            actor   = token.actor;
        } else if (caller.isToken) {
            actor   = caller;
            token   = caller.token;
        } else {
            actor = caller;
        }
        if (!token && !actor) return;

        const opt = {isCombatant: false};
        const comData = {};
        const {active} = game.combats;
        if (active) {
            comData.round = active.round;
            comData.combatant = token
                ? active.getCombatantByToken(token.id)
                : active.getCombatantByActor(actor.id);
            comData.initiative = comData.combatant?.initiative;
            opt.isCombatant    = Number.isInteger(comData.initiative) && comData.round > 0;
        }

        const dialog = 'cast';
        const dialogDataset = {dialog, itemId: spell};
        dialogDataset.isNPC = comData?.combatant?.isNPC || false;

        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog(dialogDataset, actor, opt);

        const {resp} = dialogResp;
        const context = actor.items.get(spell);

        if (!resp.divine && resp.button === 'declare') {
            const sum = resp.cost + (resp.schedule || 0);
            const {sp} = actor.system;
            if (sum > sp.value) {
                ui.notifications.warn(game.i18n.localize('HM.dialog.warnSP'));
                return;
            }
            sp.value -= sum;
            await actor.update({'data.sp': sp});
        }

        if (resp.divine && resp.button === 'cast') {
            let {prepped} = context.system;
            if (prepped > 0) await context.update({'data.prepped': --prepped});
        }

        const chatMgr = new HMChatMgr();
        const dataset = {
            dialog,
            context,
            caller: dialogResp.caller,
            resp,
        };

        if (resp.button === 'cast') {
            const level = actor.itemTypes.cclass.length
                ? caller.itemTypes.cclass[0].system.level
                : parseInt(caller.system.level, 10) || 1;
            dataset.roll = await new Roll(HMTABLES.formula.save.target, {level})
                                         .evaluate({async: true});
        }

        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);

        if (dialogResp.resp.advance) await advanceClock(comData, dialogResp, false);

        if (opt.isCombatant && dialogResp.resp.sfatigue) {
            setStatusEffectOnToken(comData, 'sfatigue', dialogResp.resp.sfatigue);
        }
    }
}
