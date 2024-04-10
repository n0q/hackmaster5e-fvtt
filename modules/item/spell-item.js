import { HMItem, advanceClock, setStatusEffectOnToken } from './item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMTABLES } from '../tables/constants.js';

export class HMSpellItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    /**
     * Asynchronously rolls a spell and handles the associated actions.
     *
     * @param {Object} param0 - An object containing the spell and caller.
     * @param {string} param0.spell - The UUID of the spell object to be rolled.
     * @param {HMToken|HMActor} [param0.caller] - The actor or token object
     * initiating the roll. Optional.
     * @returns {Promise<void>} A promise that resolves when the roll is complete,
     * or nothing if no actor or token is found.
     */
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
        const dialogResp = await HMDialogFactory(dialogDataset, actor, opt);

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
            const {system} = caller;
            const roll = await new Roll(HMTABLES.formula.save.spell, system).evaluate();
            roll.sfc = roll.dice[0].total + actor.system.bonus.total.sfc;
            dataset.roll = roll;
        }

        const card = await chatMgr.getCard({dataset});
        await ChatMessage.create(card);

        if (opt.isCombatant) {
            if (resp.advance) await advanceClock(comData, dialogResp, true);
            if (resp.sfatigue) setStatusEffectOnToken(comData, 'sfatigue', resp.sfatigue);
        }
    }

    get baseSPC() {
        return HMTABLES.cast.baseSPC(this.system.lidx);
    }
}
