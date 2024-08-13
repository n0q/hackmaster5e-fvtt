/**
 * @file Support functions for elevationruler.
 */

export const tokenHPAttribute='actor.system.hp.value';

/**
 * Returns the distance a token moved last round.
 * @param {Token} token - Token to inspect.
 * @param {number} round - The current round of combat.
 * @returns {number} distance the token moved last round.
 */
export const getLastMovedDistance = (token, round) => {
    const {combatMoveData} = token.flags.elevationruler.movementHistory;
    const lastRound = Object.values(combatMoveData).find((d) => d.lastRound === round - 1);
    return lastRound?.lastMoveDistance ?? 0;
};

/**
 * Array of non-combat speed colors.
 * @type {Array<Color>}
 */
const nonCombatColor = [
    Color.from(0x00ff00), // Green (walk)
    Color.from(0xffff00), // Yellow (jog)
    Color.from(0xff8000), // Orange (run)
    Color.from(0xff0000), // Red (sprint)
    Color.from(0x000000), // Black (invalid)
];

/**
 * Array of combat speed colors.
 * @type {Array<Color>}
 */
const combatColor = [
    Color.from(0x00ff00), // Green (0)
    Color.from(0xffff00), // Yellow (±1)
    Color.from(0xff8000), // Orange (±2)
    Color.from(0x000000), // Black (invalid)
    Color.from(0x000000), // Black (invalid)
];

/**
 * Returns a non-combat color for the elevationruler segment.
 * @param {number} idx
 * @returns {Color}
 */
function getNonCombatColorFromIndex(idx) {
    return nonCombatColor[idx - 1];
}

/**
 * Get the color based on the token's prior movement distance.
 * @param {Token} token
 * @param {number} idx
 * @returns {Color}
 */
function getColorFromPriorMoveDistance(token, idx) {
    const {combat} = game;
    if (!combat) return getNonCombatColorFromIndex(idx);
    const {round} = game.combat;
    const combatant = combat.getCombatantByToken(token.id);
    if (!combatant || !round) return getNonCombatColorFromIndex(idx);

    // Illegal.
    if (idx === 5) return combatColor[4];

    const moved = token.document.prevLastMovedDistance || 0;
    const movespdSet = new Set([0, ...token.actor.movespd.slice(1), Infinity]);
    const movespd = Array.from(movespdSet);

    const colorMask = [0, 1, 2, 3, 3, 2, 1];

    const ridx = moved === 0 ? -1 : Math.clamp(movespd.findIndex((a) => moved <= a) - 1, 0, 4);
    const colorMaskRot = rotateArray(colorMask, ridx);
    return combatColor[colorMaskRot[idx - 1]];
}

/**
 * Rotates an array.
 * @param {Array} arr - Array to be rotated.
 * @param {number} count - number of elements to be rotated. Negative to rotate left.
 * @returns {Array} Rotated array.
 */
function rotateArray(arr, count) {
    const r = count % arr.length;
    return arr.slice(-r).concat(arr.slice(0, -r));
}

/**
 * @typedef {Object} SpeedCategory
 * @property {string} name
 * @property {function} color
 * @property {number} multiplier
 * @property {number} idx
 * @property {Object|null} token
 */

/**
 * @type {SpeedCategory}
 */
const WalkSpeedCategory = {
    name: 'Walk',
    get color() { return getColorFromPriorMoveDistance(this.token, this.idx); },
    multiplier: 1,
    idx: 1,
    token: null,
};

/**
 * @type {SpeedCategory}
 */
const JogSpeedCategory = {
    name: 'Jog',
    get color() { return getColorFromPriorMoveDistance(this.token, this.idx); },
    multiplier: 1,
    idx: 2,
    token: null,
};

/**
 * @type {SpeedCategory}
 */
const RunSpeedCategory = {
    name: 'Run',
    get color() { return getColorFromPriorMoveDistance(this.token, this.idx); },
    multiplier: 1,
    idx: 3,
    token: null,
};

/**
 * @type {SpeedCategory}
 */
const SprintSpeedCategory = {
    name: 'Sprint',
    get color() { return getColorFromPriorMoveDistance(this.token, this.idx); },
    multiplier: 1,
    idx: 4,
    token: null,
};

/**
 * @type {SpeedCategory}
 */
const IllegalSpeedCategory = {
    name: 'Illegal',
    get color() { return getColorFromPriorMoveDistance(this.token, this.idx); },
    multiplier: Number.POSITIVE_INFINITY,
    idx: 5,
    token: null,
};

/**
 * Speed provider. Is merged into CONFIG.elevationruler.SPEED.
 * @type {Object}
 * @property {Array<SpeedCategory>} CATEGORIES
 * @property {function} tokenSpeed
 * @property {function} maximumCategoryDistance
 */
export const HM_ER_SPEED = {
    CATEGORIES: [
        WalkSpeedCategory,
        JogSpeedCategory,
        RunSpeedCategory,
        SprintSpeedCategory,
        IllegalSpeedCategory,
    ],

    tokenSpeed: (token) => token.actor.movespd,

    /**
     * Get the maximum distance a token can move for a given speed category.
     * @param {HMToken} token - The token object.
     * @param {SpeedCategory} speedCategory - The speed category object.
     * @param {number} tokenSpeed - The speed of the token.
     * @returns {number} - The maximum distance the token can move.
     */
    maximumCategoryDistance: (token, speedCategory, tokenSpeed) => {
        const {idx} = speedCategory;
        speedCategory.token = token; // eslint-disable-line no-param-reassign
        return speedCategory.multiplier * tokenSpeed[idx];
    },
};
