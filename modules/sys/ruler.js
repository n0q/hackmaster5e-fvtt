import { systemPath } from '../tables/constants.js';

/**
 * @extends foundry.canvas.placeables.tokens.TokenRuler
 */
export class HMRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    static WAYPOINT_LABEL_TEMPLATE = systemPath('templates/hud/waypoint-label.hbs');

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

        const { token } = this;
        context.inCombat = token.inCombat;
        if (context.inCombat && token.combatant) {
            context.cost.prev = this.#getCostPrev();
            context.cost.totalLabel = this.#getMoveIndex(context.cost.total);

            const movementAction = token.document.movementAction;
            context.movementActionKeyPath = `movement.action.${movementAction}`;
        }
        return context;
    }

    /**
    * Gets the formatted previous movement cost from a token's combatant.
    * @private
    *
    * @returns {string|undefined} Previous movement cost, formatted as a string to two decimal
    *                             places, or undefined if there was no cost.
    */
    #getCostPrev() {
        const { system } = this.token.combatant;
        const unscaledPrevCost = Number(system?.cost?.prev);
        return unscaledPrevCost ? unscaledPrevCost.toFixed(2) : undefined;
    }

    /**
     *  Calculates movement tier index based on token's cost.total and actor's movespd.
     *  @private
     *
     *  @param {number|string} cost - Total movement cost to compare against movespd.
     */
    #getMoveIndex(cost) {
        const costValue = Number(cost);
        if (!costValue) return undefined;

        const movespd = this.token.actor.movespd.slice(1);
        movespd.push(Infinity);

        const moveidx = movespd.findIndex((m) => m >= costValue);
        return moveidx;
    }
}
