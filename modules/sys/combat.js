/* eslint max-classes-per-file: ['error', 2] */
import { SYSTEM_ID } from '../tables/constants.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMChatFactory, CHAT_TYPE } from '../chat/chat-factory.js';

export class HMCombat extends Combat {
    /** @override */
    nextTurn() {
        return this.nextRound();
    }

    /** @override */
    _sortCombatants(a, b) { // eslint-disable-line
        return a.isNPC - b.isNPC || a.name.localeCompare(b.name);
    }

    /** @override */
    async _getInitiativeDie(ids) {
        const caller = ids.length ? this.combatants.get(ids[0]).actor : null;
        const dialogResp = await HMDialogFactory({ dialog: 'initdie' }, caller);
        return dialogResp.resp.die;
    }

    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        const { round } = this;
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

        const rollData = { formula: initFormula, updateTurn, messageOptions };
        return super.rollInitiative(ids, rollData);
    }

    async doHueAndCry() {
        const { combatants, round } = this;
        const { user } = game;
        const canHaC = combatants.filter((c) => c.initiative > round && !c.getFlag(SYSTEM_ID, 'acted'));

        const { controlled } = canvas.tokens;

        const allCombatants = user.isGM
            ? canHaC.filter((a) => a.isNPC)
            : canHaC.filter((a) => a.players.includes(user));

        const stack = controlled.length
            ? canHaC.filter((c) => controlled.find((t) => t.id === c.tokenId))
            : allCombatants;

        if (!stack.length) {
            ui.notifications.warn('No valid combatants selected.');
            return;
        }

        const batch = stack.map((c) => {
            const oldInit = c.initiative;
            const newInit = Math.max(oldInit - 2, round);
            this.setInitiative(c.id, newInit);
            return {
                delta: newInit - oldInit,
                hidden: c.hidden,
                name: c.token.name,
                oldInit,
                newInit,
            };
        });

        const builder = await HMChatFactory.create(CHAT_TYPE.INIT_NOTE, { batch });
        builder.createChatMessage();
    }
}

export class HMCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
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
