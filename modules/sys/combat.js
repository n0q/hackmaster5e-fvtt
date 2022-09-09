/* eslint max-classes-per-file: ['error', 2] */
import { HMDialogMgr } from '../mgr/dialogmgr.js';

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
                                                       && y.disabled
                                                       && y.duration.combat.id === combat.id);
            effects.forEach((effect) => x.actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]));
        });
    }
}

export class HMCombatTracker extends CombatTracker {
    static get defaultOptions() {
        const opt = super.defaultOptions;
        opt.title = "Count Up";
        return opt;
    }

    static renderCombatTracker(tracker, html, data) {
        removeTurnControls(html);
        DoubleclickSetsInitiative(html);

        function removeTurnControls(html) {
            if (!html.find("[data-control='nextTurn']").length) return;
            html.find("[data-control='nextTurn']")[0].remove();
            html.find("[data-control='previousTurn']")[0].remove();
            html.find(".active").removeClass("active");
        }

        function DoubleclickSetsInitiative(html) {
            html.find('.token-initiative').off('dblclick').on('dblclick', HMCombatTracker._onInitiativeDblClick);
            for (let combatant of html.find('#combat-tracker li.combatant')) {
                if (combatant.classList.contains('active')) break;
                combatant.classList.add('turn-done');
            }
        }
    }

    // Adapted from FurnaceCombatQoL
    static _onInitiativeDblClick(event) {
        event.stopPropagation();
        event.preventDefault();
        let html = $(event.target).closest(".combatant");
        let cid = html.data("combatant-id");
        let combatant = game.combat.combatants.get(cid);
        if (!combatant.isOwner) return;

        let initiative = html.find(".token-initiative");
        let input = $(`<input type="number" class="initiative" value="${combatant.initiative}"/>`);
        initiative.off("dblclick");
        initiative.empty().append(input);
        input.focus().select();
        input.on('change', ev => combatant.update({ _id: cid, initiative: input.val() }));
        input.on('focusout', ev => game.combats.render());
    }

    // Shorting out mousedown events on token initiative so dblclicks
    // don't trigger normal mousedown events (panning and sheet renders).
    async _onCombatantMouseDown(event) {
        const html = $(event.target).closest('.token-initiative');
        if (html.length) return;
        super._onCombatantMouseDown(event);
    }
}
