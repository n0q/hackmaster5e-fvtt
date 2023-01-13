/* eslint max-classes-per-file: ['error', 2] */
import { HMDialogFactory } from '../dialog/dialog-factory.js';

export class HMCombat extends Combat {
    nextTurn() { return this.nextRound(); }

    _sortCombatants(a, b) { return -super._sortCombatants(a, b); }

    async _getInitiativeDie(ids) {
        const caller = ids.length ? this.combatants.get(ids[0]).actor : null;
        const dialogResp = await HMDialogFactory({dialog: 'initdie'}, caller);
        return dialogResp.resp.die;
    }

    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
        const {round} = this;
        let initFormula = formula;
        if (!initFormula) {
            const initDie = await this._getInitiativeDie(ids);
            if (initDie) {
                initFormula = `{${initDie} + ${game.system.initiative}, 1}kh + ${round}`;
            } else {
                initFormula = `${Math.max(round, 1)}`;
                messageOptions.sound = null; // eslint-disable-line
            }
        }

        const rollData = {formula: initFormula, updateTurn, messageOptions};
        return super.rollInitiative(ids, rollData);
    }
}

export class HMCombatTracker extends CombatTracker {
    static get defaultOptions() {
        const opt = super.defaultOptions;
        opt.title = game.i18n.localize('HM.countup');
        return opt;
    }

    // Shorting out mousedown events on token initiative so dblclicks
    // don't trigger normal mousedown events (panning and sheet renders).
    async _onCombatantMouseDown(event) {
        const html = $(event.target).closest('.token-initiative');
        if (html.length) return;
        super._onCombatantMouseDown(event);
    }
}
