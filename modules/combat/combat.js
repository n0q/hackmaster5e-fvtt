import { SYSTEM_ID } from "../tables/constants.js";
import { getSignedTerm } from "../sys/utils.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";
import { InitiativePrompt } from "../apps/initiative-application.js";

export class HMCombat extends foundry.documents.Combat {
    /**
     * Advance the combat to the next round.
     * Records total movement cost and distance.
     * @override
     * @async
     *
     * @returns {Promise<this>}
     */
    async nextRound() {
        const updates = this.combatants.map(combatant => {
            const { token } = combatant;
            const waypoints = token.movementHistory;
            const measuredMovementPath = token.measureMovementPath(waypoints);
            const { cost, distance } = measuredMovementPath;
            return {
                _id: combatant.id,
                [`flags.${SYSTEM_ID}.prevCost`]: cost,
                [`flags.${SYSTEM_ID}.prevDistance`]: distance,
            };
        });
        await this.updateEmbeddedDocuments("Combatant", updates);

        return super.nextRound();
    }

    /** @override */
    _sortCombatants(a, b) { // eslint-disable-line
        return a.isNPC - b.isNPC || a.name.localeCompare(b.name);
    }

    /**
     * Returns an initiative formula, optionally in templated form.
     *
     * @param {object} formvalue - An object of values from which to build a formula.
     * @param {boolean} isTemplate - If the formula should be templated or not.
     * @return {string} The completed formula.
     */
    static getInitiativeFormula(formulaObj, isTemplate = false) {
        const selectedDie = formulaObj?.selectedDie || "1d12";
        const round = formulaObj?.round || 0;

        if (selectedDie === "immediate") {
            return String(Math.max(1, round));
        }

        const modifier = Number(formulaObj?.modifier) || 0;
        const bonus = formulaObj?.bonus;

        const bonusTerm = getSignedTerm(bonus);
        const modTerm = getSignedTerm(modifier);
        const roundTerm = getSignedTerm(round);

        let formula = isTemplate
            ? `{${selectedDie} + ${game.system.initiative} ${modTerm}, 1}kh`
            : `{${selectedDie} ${bonusTerm} ${modTerm}, 1}kh`;

        if (round >= 0) formula += `${roundTerm}`;
        return formula;
    }

    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        let initFormula = formula;

        if (!initFormula) {
            const caller = ids.length ? this.combatants.get(ids[0]).actor : null;
            const result = await InitiativePrompt.create({},
                { subject: { combat: this, actor: caller } },
            );

            if (!result) return;

            const isTemplate = true;
            initFormula = HMCombat.getInitiativeFormula(result, isTemplate);
            console.warn(initFormula);
            if (result.isImmediate) {
                messageOptions.sound = null;
            }
        }

        const rollData = { formula: initFormula, updateTurn, messageOptions };
        return super.rollInitiative(ids, rollData);
    }

    async doHueAndCry() {
        const { combatants, round } = this;
        const { user } = game;
        const canHaC = combatants.filter(c => c.initiative > round && !c.getFlag(SYSTEM_ID, "acted"));

        const { controlled } = canvas.tokens;

        const allCombatants = user.isGM
            ? canHaC.filter(a => a.isNPC)
            : canHaC.filter(a => a.players.includes(user));

        const stack = controlled.length
            ? canHaC.filter(c => controlled.find(t => t.id === c.tokenId))
            : allCombatants;

        if (!stack.length) {
            ui.notifications.warn("No valid combatants selected.");
            return;
        }

        const batch = stack.map(c => {
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
