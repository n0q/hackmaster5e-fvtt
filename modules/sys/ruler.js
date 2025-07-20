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
            const unscaledPrevMovementCost = token.combatant.system?.prevMovementCost;
            context.totalPrevMovementCost = unscaledPrevMovementCost.toFixed(2) || 0;
        }

        return context;
    }
}
