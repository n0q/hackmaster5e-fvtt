/**
 * Hackmaster speed-category helpers.
 *
 * A token's `movespd` is an ordered array of speed thresholds:
 * [crawl, walk, jog, run, sprint]. Movement rules let a creature change up to two
 * speed categories per second, where crawling is explicitly ignored.
 */

/**
 * Maps a movement distance to its speed category. Crawl (movespd[0]) is ignored entirely for
 * these rules: walking spans (0, movespd[1]], so any movement up to walk speed is category 1.
 * Bands are upper-bound inclusive, matching the rule that a creature is "sprinting" the instant
 * it exceeds run speed. Standstill is category 0; distances beyond the top speed cap at sprint.
 *
 * @param {number} distance - Distance moved, in scene units.
 * @param {number[]} movespd - Ordered speed thresholds [crawl, walk, jog, run, sprint].
 * @returns {number} Speed category index.
 */
export function getMoveCategory(distance, movespd) {
    if (!(distance > 0)) return 0;
    for (let i = 1; i < movespd.length; i++) {
        if (distance <= movespd[i]) return i;
    }
    return movespd.length - 1;
}

/**
 * Signed change in speed category between a previous and current movement.
 *
 * @param {number} current - This round's movement distance, in scene units.
 * @param {number} prev - Last round's movement distance, in scene units.
 * @param {number[]} movespd - Ordered speed thresholds [crawl, walk, jog, run, sprint].
 * @returns {number} Signed category delta (positive = faster, negative = slower).
 */
export function getMoveCategoryDelta(current, prev, movespd) {
    return getMoveCategory(current, movespd) - getMoveCategory(prev, movespd);
}
