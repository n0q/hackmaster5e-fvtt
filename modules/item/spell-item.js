import { HMItem, advanceClock, setStatusEffectOnToken } from './item.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMChatFactory, CHAT_TYPE } from '../chat/chat-factory.js';
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
            await actor.update({'system.sp': sp});
        }

        if (resp.divine && resp.button === 'cast') {
            let {prepped} = context.system;
            if (prepped > 0) await context.update({'system.prepped': --prepped});
        }

        if (opt.isCombatant) {
            if (resp.advance) await advanceClock(comData, dialogResp, true);
            if (resp.sfatigue) setStatusEffectOnToken(comData, 'sfatigue', resp.sfatigue);
        }

        const mdata = {isNPC: comData?.combatant?.isNPC || false};
        const bData = {caller: actor, context, mdata, resp};

        if (shouldPerformRoll(resp, context)) {
            bData.roll = await new Roll(HMTABLES.formula.spell.baseroll).evaluate();
        }

        const builder = new HMChatFactory(CHAT_TYPE.SPELL, bData);
        builder.createChatMessage();
    }

    get baseSPC() {
        return HMTABLES.cast.baseSPC(this.system.lidx);
    }
}

/**
 * Determines if a roll should be performed based on dialog response and context.
 *
 * @param {Object} resp - Dialog response.
 * @param {HMSpellItem} context - Spell being evaluated.
 */
function shouldPerformRoll(resp, context) {
    if (resp.button !== 'cast') return false;
    const {system} = context;
    return !system.divine || !!system.save.type;
}
