/**
 * Enumeration for chat result codes.
 * @enum {Symbol}
 */
export const RESULT_TYPE = {
    NONE: Symbol('result_none'),
    CRITFAIL: Symbol('result_critfail'),
    DCRITFAIL: Symbol('result_dcritfail'),
    FAILED: Symbol('result_failed'),
    FUMBLE: Symbol('result_fumble'),
    GOODBYE: Symbol('result_goodbye'),
    NEAR_PERFECT: Symbol('result_near_perfect'),
    PASSED: Symbol('result_passed'),
    PERFECT: Symbol('result_perfect'),
    SKILL4: Symbol('result_skill_trivial'),
    SKILL3: Symbol('result_skill_easy'),
    SKILL2: Symbol('result_skill_avg'),
    SKILL1: Symbol('result_skill_diff'),
    SKILL0: Symbol('result_skill_vdiff'),
    SUPERIOR: Symbol('result_superior'),
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
        [RESULT_TYPE.CRITFAIL, `<b>${game.i18n.localize('HM.CHAT.RESULT.critfail')}</b>`],
        [RESULT_TYPE.DCRITFAIL, `<b>${game.i18n.localize('HM.CHAT.RESULT.dcritfail')}</b>`],
        [RESULT_TYPE.FAILED, `<b>${game.i18n.localize('HM.CHAT.RESULT.failed')}</b>`],
        [RESULT_TYPE.FUMBLE, `<b>${game.i18n.localize('HM.CHAT.RESULT.fumble')}</b>`],
        [RESULT_TYPE.GOODBYE, `<b>${game.i18n.localize('HM.CHAT.RESULT.goodbye')}</b>`],
        [RESULT_TYPE.NEAR_PERFECT, `<b>${game.i18n.localize('HM.CHAT.RESULT.nperfect')}</b>`],
        [RESULT_TYPE.PASSED, `<b>${game.i18n.localize('HM.CHAT.RESULT.passed')}</b>`],
        [RESULT_TYPE.PERFECT, `<b>${game.i18n.localize('HM.CHAT.RESULT.perfect')}</b>`],
        [RESULT_TYPE.SKILL4, `<b>${game.i18n.localize('HM.CHAT.RESULT.skill4')}</b>`],
        [RESULT_TYPE.SKILL3, `<b>${game.i18n.localize('HM.CHAT.RESULT.skill3')}</b>`],
        [RESULT_TYPE.SKILL2, `<b>${game.i18n.localize('HM.CHAT.RESULT.skill2')}</b>`],
        [RESULT_TYPE.SKILL1, `<b>${game.i18n.localize('HM.CHAT.RESULT.skill1')}</b>`],
        [RESULT_TYPE.SKILL0, `<b>${game.i18n.localize('HM.CHAT.RESULT.skill0')}</b>`],
        [RESULT_TYPE.SUPERIOR, `<b>${game.i18n.localize('HM.CHAT.RESULT.superior')}</b>`],
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
