import { SYSTEM_ID } from "../tables/constants.js";
import { getSignedTerm } from "../sys/utils.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";
import { InitiativePrompt } from "../apps/initiative-application.js";

export class HMCombat extends foundry.documents.Combat {
    /**
     * Advance the combat to the next round.
     * Records total movement cost and distance.
     *
     * @override
     * @async
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
    _sortCombatants(a, b) {
        return a.isNPC - b.isNPC || a.name.localeCompare(b.name);
    }

    /**
     * Returns an initiative formula based on the provided formula object.
     *
     * @param {object} formulaObj - An object containing formula components.
     * @param {string} [formulaObj.selectedDie="1d12"] - The die to roll or "immediate".
     * @param {number} [formulaObj.modifier=0] - Manual modifier to the roll.
     * @param {number} [formulaObj.bonus=0] - Character's initiative bonus.
     * @param {number} [formulaObj.round=0] - Current combat round.
     * @param {boolean} [isTemplate=false] - If the formula should be templated or not.
     * @return {string} The completed formula.
     */
    static getInitiativeFormula(formulaObj, isTemplate = false) {
        const {
            selectedDie = "1d12",
            modifier = 0,
            bonus = 0,
            round = 0
        } = formulaObj;

        if (selectedDie === "immediate") {
            return String(Math.max(1, round));
        }
        const bonusTerm = Number(bonus) ? getSignedTerm(bonus) : "";
        const modTerm = Number(modifier) ? getSignedTerm(modifier) : "";
        const roundTerm = Number(round) ? getSignedTerm(round) : "";

        let formula = isTemplate
            ? `{${selectedDie} + ${game.system.initiative} ${modTerm}, 1}kh ${roundTerm}`
            : `{${selectedDie} ${bonusTerm} ${modTerm}, 1}kh ${roundTerm}`;

        return formula;
    }

    /**
     * Roll initiative for one or multiple combatants.
     *
     * @override
     */
    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        let initFormula = formula;

        if (!initFormula) {
            const caller = ids.length
                ? this.combatants.get(ids[0]).actor
                : null;

            const result = await InitiativePrompt.create({},
                { subject: { combat: this, actor: caller } },
            );

            if (!result) return;

            initFormula = HMCombat.getInitiativeFormula(result, true);

            if (result.isImmediate) {
                messageOptions.sound = null;
            }
        }

        const rollData = { formula: initFormula, updateTurn, messageOptions };
        return super.rollInitiative(ids, rollData);
    }

    /**
     * Execute a Hue and Cry action for eligible combatants.
     */
    async doHueAndCry() {
        const { combatants, round } = this;
        const { user } = game;

        // Filter combatants who can perform Hue and Cry
        const canHaC = combatants.filter(c =>
            c.initiative > round
            && !c.getFlag(SYSTEM_ID, "acted")
        );

        const { controlled } = canvas.tokens;

        // Determine which combatants the user can control
        const allCombatants = user.isGM
            ? canHaC.filter(a => a.isNPC)
            : canHaC.filter(a => a.players.includes(user));

        // Use controlled tokens if any, otherwise all eligible combatants
        const stack = controlled.length
            ? canHaC.filter(c => controlled.find(t => t.id === c.tokenId))
            : allCombatants;

        if (!stack.length) {
            ui.notifications.warn("No valid combatants selected.");
            return;
        }

        // Process initiative changes
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

        // Create chat message for the action
        const builder = await HMChatFactory.create(CHAT_TYPE.INIT_NOTE, { batch });
        builder.createChatMessage();
    }
}
