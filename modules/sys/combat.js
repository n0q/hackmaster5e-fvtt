/* eslint max-classes-per-file: ['error', 2] */
import { HMDialogMgr } from '../mgr/dialogmgr.js';

function onInitiativeDblClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const html = $(event.target).closest('.combatant');
    const cid = html.data('combatant-id');
    const combatant = game.combat.combatants.get(cid);
    if (!combatant.isOwner) return;

    const initiative = html.find('.token-initiative');
    const input = $(`<input type="number" class="initiative" value="${combatant.initiative}"/>`);
    initiative.off('dblclick');
    initiative.empty().append(input);
    input.focus().select();
    input.on('change', () => combatant.update({ _id: cid, initiative: input.val() }));
    input.on('focusout', () => game.combats.render());
}

export class HMCombat extends Combat {
    nextTurn() { return this.nextRound(); }

    _sortCombatants(a, b) { return -super._sortCombatants(a, b); }

    async _getInitiativeDie(ids) {
        const caller = ids.length ? this.combatants.get(ids[0]).actor : null;
        const dialogMgr = new HMDialogMgr();
        const dialogResp = await dialogMgr.getDialog({dialog: 'initdie'}, caller);
        return dialogResp.resp.die;
    }

    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
        let initFormula = formula;
        if (!initFormula) {
            const initDie = await this._getInitiativeDie(ids);
            if (initDie) {
                initFormula = `${initDie} + ${game.system.initiative}`;
            } else {
                initFormula = '1';
                messageOptions.sound = null;
            }
        }

        const rollData = {formula: initFormula, updateTurn, messageOptions};
        return super.rollInitiative(ids, rollData);
    }

    static async updateCombat(combat) {
        const combatants = combat.turns;
        combatants.forEach((x) => {
            // Toggle status effects on/off based on their timers.
            const effects = x.actor.effects.filter((y) => y.isTemporary === true);
            effects.forEach(async (effect) => {
                const {remaining, startRound} = effect.duration;
                const started = startRound <= combat.round;
                if ((!started &&               !effect.disabled)        // Case 1: Before effect
                  || (started &&  remaining &&  effect.disabled)        // Case 2: During effect
                  || (started && !remaining && !effect.disabled)) {     // Case 3: After effect
                    await effect.update({disabled: !effect.disabled});
                    if (effect.disabled) effect._displayScrollingStatus(false);
                }
            });
        });
    }

    static async preDeleteCombat(combat) {
        const combatants = combat.turns;

        combatants.forEach((x) => {
            const effects = x.actor.effects.filter((y) => y.isTemporary
                                                       && y.disabled);
                                                    // && y.duration.combat.id === combat.id);
            effects.forEach((effect) => x.actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]));
        });
    }

    static async createCombatant(combatant) {
        const {tokenId} = combatant;
        const token = game.canvas.tokens.placeables.find((x) => x.id === tokenId);
        if (token) token.drawReach();
    }

    static async deleteCombatant(combatant) {
        const {tokenId} = combatant;
        const token = game.canvas.tokens.placeables.find((x) => x.id === tokenId);
        if (token) token.drawReach();
    }
}

export class HMCombatTracker extends CombatTracker {
    static get defaultOptions() {
        const opt = super.defaultOptions;
        opt.title = game.i18n.localize('HM.countup');
        return opt;
    }

    static renderCombatTracker(_tracker, html) {
        function removeTurnControls(combatDocument) {
            if (!combatDocument.find('[data-control=\'nextTurn\']').length) return;
            combatDocument.find('[data-control=\'nextTurn\']').each((_, el) => el.remove());
            combatDocument.find('[data-control=\'previousTurn\']')[0].remove();
            combatDocument.find('.active').removeClass('active');
        }

        function DoubleclickSetsInitiative(combatDocument) {
            combatDocument.find('.token-initiative').off('dblclick').on('dblclick', onInitiativeDblClick);
            combatDocument.find('#combat-tracker li.combatant').each((_, el) => {
                if (el.classList.contains('active')) return;
                el.classList.add('turn-done');
            });
        }

        removeTurnControls(html);
        DoubleclickSetsInitiative(html);
    }

    // Shorting out mousedown events on token initiative so dblclicks
    // don't trigger normal mousedown events (panning and sheet renders).
    async _onCombatantMouseDown(event) {
        const html = $(event.target).closest('.token-initiative');
        if (html.length) return;
        super._onCombatantMouseDown(event);
    }
}
