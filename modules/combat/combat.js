import { SYSTEM_ID } from '../tables/constants.js';
import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMChatFactory, CHAT_TYPE } from '../chat/chat-factory.js';

export class HMCombat extends foundry.documents.Combat {
    /**
     * Advance the combat to the next round.
     * Records total movement cost to system.prevMovementCost.
     * @override
     * @async
     *
     * @returns {Promise<this>}
     */
    async nextRound() {
        const updates = this.combatants.map((combatant) => {
            const movementHistory = combatant.token.movementHistory;
            const prevMovementCost = movementHistory.reduce((acc, wp) => acc + wp.cost, 0);
            return { _id: combatant.id, 'system.prevMovementCost': prevMovementCost };
        });

        await this.updateEmbeddedDocuments('Combatant', updates);

        return super.nextRound();
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
