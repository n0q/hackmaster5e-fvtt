import { SYSTEM_ID, systemPath } from "../tables/constants.js";

/**
 * @extends foundry.canvas.placeables.tokens.TokenRuler
 */
export class HMTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    static WAYPOINT_LABEL_TEMPLATE = systemPath("templates/hud/waypoint-label.hbs");

    /**
     * Adds combat-specific context for rendering a waypoint label.
     * @override
     *
     * @param {...any} args - Arguments passed to the parent method (see FoundryVTT docs for details).
     * @returns {object|void} The context object for the waypoint label.
     *
     * @see foundry.canvas.placeables.tokens.TokenRuler#_getWaypointLabelContext
     */
    _getWaypointLabelContext(...args) {
        const context = super._getWaypointLabelContext(...args);
        if (!context) return context;

        const snapTarget = this.token._snapState?.target;
        if (snapTarget != null) {
            const formatted = snapTarget.toFixed(2);
            if (context.cost) context.cost.total = formatted;
            if (context.distance) context.distance.total = formatted;
        }

        const { token } = this;
        context.inCombat = token.inCombat;
        if (context.inCombat && token.combatant) {
            context.cost.prev = this.#getFormattedPrevValue("prevCost");
            context.cost.totalLabel = this.#getMoveIndex(context.cost.total);
            context.distance.prev = this.#getFormattedPrevValue("prevDistance");
            context.distance.totalLabel = this.#getMoveIndex(context.distance.total);

            const movementAction = token.document.movementAction;
            context.movementActionKeyPath = `movement.action.${movementAction}`;
        }
        return context;
    }

    /**
     * Gets the formatted previous movement cost from a token's combatant.
     * @private
     *
     * @param {'cost'|'distance'} key - Which system.key to retrieve the value of.
     * @returns {string|undefined} Previous movement cost, formatted as a string to two decimal
     *                             places, or undefined if there was no cost.
     */
    #getFormattedPrevValue(key) {
        let value = Number(this.token?.combatant.getFlag(SYSTEM_ID, key));
        if (!value) return undefined;

        const movespd = this.token.actor?.movespd;
        if (movespd) {
            for (const rate of movespd.slice(1)) {
                if (rate > 0 && Math.abs(value - rate) < 0.1) { value = rate; break; }
            }
        }
        return value.toFixed(2);
    }

    /**
     *  Calculates movement tier index based on token's total movement and actor's movespd.
     *  @private
     *
     *  @param {number|string} moved - Total movement to compare against movespd.
     */
    #getMoveIndex(moved) {
        const moveValue = Number(moved);
        if (!moveValue) return undefined;

        const movespd = this.token.actor.movespd.slice(1);
        movespd.push(Infinity);

        const moveidx = movespd.findIndex(m => m >= moveValue);
        return moveidx;
    }

    /**
     * Returns the total scaled cost of the token's planned movement.
     *
     * @returns {number} Total movement cost.
     */
    get plannedMovementCost() {
        let plannedMovementCost = 0;
        for (const [userId, movement] of Object.entries(this.token._plannedMovement)) {
            if (movement.hidden && (userId !== game.user.id)) continue;
            plannedMovementCost += this.token.measureMovementPath(movement.history).cost;
            plannedMovementCost += this.token.measureMovementPath(movement.foundPath).cost;
        }

        return plannedMovementCost;
    }
}
