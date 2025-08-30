import { HMCONST } from "../tables/constants.js";
import { SKILL_TYPES } from "../item/schema/skill-item-schema.js";

/**
 * Handles dishonor penalties applied through the aggregator system.
 * Provides penalty vectors for various item types when an actor has low honor.
 */
export class Dishonor {
    /**
     * Base penalty values applied for different systems.
     * @type {Object}
     * @private
     */
    static #BASE_PENALTIES = {
        skills: -5,
    };

    /**
     * Determines if an actor is considered dishonorable based on their honor bracket.
     * @param {HMActor} actor - The actor to check
     * @returns {boolean} True if the actor's honor is below the low threshold
     */
    static isDishonorable(actor) {
        return actor?.system?.honor?.bracket < HMCONST.HONOR.LOW || false;
    }

    /**
     * Generates a penalty vector for the specified item type if the actor is dishonorable.
     * Returns null if the actor is not dishonorable or if no vector builder exists for the item type.
     *
     * @param {string} itemType - The type of item to generate penalties for
     * @param {HMActor} actor - The actor receiving the penalties
     * @returns {Object|null} Vector object suitable for aggregator.addVector() or null
     */
    static getVector(itemType, actor) {
        if (!this.isDishonorable(actor)) return null;

        const builder = this.#vectorBuilders[itemType];
        return builder ? builder(this.#BASE_PENALTIES, actor) : null;
    }

    /**
     * Vector builders for different item types.
     * Each builder function creates a vector object with appropriate penalty units.
     *
     * @type {Object<string, Function>}
     * @private
     */
    static #vectorBuilders = {
        skill: (penalties, actor) => ({
            vector: "honor",
            units: Object.fromEntries(
                SKILL_TYPES.map(type => [type, penalties.skills])
            ),
            source: actor,
            label: "Dishonor",
            path: null,
        }),
    };
}
