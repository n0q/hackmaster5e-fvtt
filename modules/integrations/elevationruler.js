/**
 * @file Support functions for elevationruler.
 */

export const tokenHPAttribute='actor.system.hp.value';

/**
 * Array of non-combat speed color.
 * @type {Array<Color>}
 */
const nonCombatColor = [
    Color.from(0x00ff00), // Green (Walk)
    Color.from(0xffff00), // Yellow (Jog)
    Color.from(0xff8000), // Orange (Run)
    Color.from(0xff0000), // Red (Sprint)
    Color.from(0x000000), // Black (Illegal)
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
 * Presently treats everything as non-combat.
 * @todo Smart/combat color banding.
 * @param {Object} token
 * @param {number} idx
 * @returns {Color}
 */
function getColorFromPriorMoveDistance(token, idx) {
    return getNonCombatColorFromIndex(idx);
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
