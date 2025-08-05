import { HMCONST } from "../../tables/constants.js";
/**
 * Enumeration for chat result codes.
 * @enum {Symbol}
 */
export const RESULT_TYPE = {
    NONE: Symbol("result_none"),
    CRITFAIL: Symbol("result_critfail"),
    DCRITFAIL: Symbol("result_dcritfail"),
    FAILED: Symbol("result_failed"),
    FUMBLE: Symbol("result_fumble"),
    GOODBYE: Symbol("result_goodbye"),
    NEAR_PERFECT: Symbol("result_near-perfect"),
    PASSED: Symbol("result_passed"),
    PERFECT: Symbol("result_perfect"),
    SKILL4: Symbol("result_skill_trivial"),
    SKILL3: Symbol("result_skill_easy"),
    SKILL2: Symbol("result_skill_avg"),
    SKILL1: Symbol("result_skill_diff"),
    SKILL0: Symbol("result_skill_vdiff"),
    SUPERIOR: Symbol("result_superior"),
};

/**
 * Special action modifier chat enumerators.
 * @enum {string}
 */
const COMBAT_MODIFIER_TYPE = {
    [HMCONST.SPECIAL.JAB]: "HM.jab",
    [HMCONST.SPECIAL.BACKSTAB]: "HM.backstab",
    [HMCONST.SPECIAL.FLEEING]: "HM.fleeing",
    [HMCONST.SPECIAL.SET4CHARGE]: "HM.s4c",

    // Synthetic status flags for boolean inputs.
    SHIELD_HIT: "HM.blocked",
    DEFENSIVE: "HM.defensive",
};

/**
 * Returns a localized, comma-separated stringh of combat modifier saber-slash
 * based on special move type and boolean combat states.
 *
 * @param {Object} resp - The dialog response object.
 * @param {number} resp.specialMove - Encoded special move bitflag.
 * @param {boolean} resp.shieldHit - Is this a shield hit?
 * @param {boolean} resp.defense - Is the attacker fighting defensively?
 * @returns {string} Localized modifier description.
 */
export const getCombatModifierFlavor = resp => {
    const { specialMove, shieldHit, defense } = resp;

    const modifierKeys = [
        COMBAT_MODIFIER_TYPE[specialMove],
        shieldHit ? COMBAT_MODIFIER_TYPE.SHIELD_HIT : null,
        defense ? COMBAT_MODIFIER_TYPE.DEFENSIVE : null,
    ];

    const mods = [];
    for (const key of modifierKeys) {
        if (key) mods.push(game.i18n.localize(key));
    }

    return mods.join(", ");
};

/**
 * A module-scoped cache for localized result strings.
 * It is populated on first use to ensure localization is ready.
 * @type {Map<Symbol, string>}
 * @private
 */
let _resultTextCache;

/**
 * Initializes #resultCache with the mapping of result types to their corresponding HTML.
 * Called only once when the cache isn't created yet.
 * @return {Map.<Symbol, string|undefined} - The initialized result mapping object.
 * @private
 */
function _initializeResultCache() {
    _resultTextCache = new Map([
        [RESULT_TYPE.CRITFAIL, game.i18n.localize("HM.CHAT.RESULT.critfail")],
        [RESULT_TYPE.DCRITFAIL, game.i18n.localize("HM.CHAT.RESULT.dcritfail")],
        [RESULT_TYPE.FAILED, game.i18n.localize("HM.CHAT.RESULT.failed")],
        [RESULT_TYPE.FUMBLE, game.i18n.localize("HM.CHAT.RESULT.fumble")],
        [RESULT_TYPE.GOODBYE, game.i18n.localize("HM.CHAT.RESULT.goodbye")],
        [RESULT_TYPE.NEAR_PERFECT, game.i18n.localize("HM.CHAT.RESULT.near-perfect")],
        [RESULT_TYPE.PASSED, game.i18n.localize("HM.CHAT.RESULT.passed")],
        [RESULT_TYPE.PERFECT, game.i18n.localize("HM.CHAT.RESULT.perfect")],
        [RESULT_TYPE.SKILL4, game.i18n.localize("HM.CHAT.RESULT.skill4")],
        [RESULT_TYPE.SKILL3, game.i18n.localize("HM.CHAT.RESULT.skill3")],
        [RESULT_TYPE.SKILL2, game.i18n.localize("HM.CHAT.RESULT.skill2")],
        [RESULT_TYPE.SKILL1, game.i18n.localize("HM.CHAT.RESULT.skill1")],
        [RESULT_TYPE.SKILL0, game.i18n.localize("HM.CHAT.RESULT.skill0")],
        [RESULT_TYPE.SUPERIOR, game.i18n.localize("HM.CHAT.RESULT.superior")],
    ]);
    return _resultTextCache;
}

/**
 * Returns the localized HTML string for a given result type.
 *
 * @param {Symbol} resultSymbol - A symbol from RESULT_TYPE.
 * @returns {string|false} The HTML string for the result, or false if the type is NONE.
 */
export function getResult(resultSymbol) {
    if (!resultSymbol || resultSymbol === RESULT_TYPE.NONE) return false;

    // Lazy load the cache on first access.
    _resultTextCache ||= _initializeResultCache();

    return _resultTextCache.get(resultSymbol) || `Unknown result type: <b>${resultSymbol.description}</b>`;
}
