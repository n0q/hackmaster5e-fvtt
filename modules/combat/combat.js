import { SYSTEM_ID } from "../tables/constants.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";
import { getInitiativeFormula } from "./initiative-utils.js";
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

            initFormula = getInitiativeFormula({ ...result, isTemplate: true });

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
