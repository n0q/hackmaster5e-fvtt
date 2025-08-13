import { getSignedTerm } from "../sys/utils.js";

/**
 * Returns an initiative formula based on the provided formula object.
 *
 * @param {object} formulaObj - An object containing formula components.
 * @param {string} [formulaObj.selectedDie="1d12"] - The die to roll or "immediate".
 * @param {number} [formulaObj.modifier=0] - Manual modifier to the roll.
 * @param {number} [formulaObj.bonus=0] - Character's initiative bonus.
 * @param {number} [formulaObj.round=0] - Current combat round.
 * @param {boolean} [formulaObj.isTemplate=false] - If the formula should be templated or not.
 * @return {string} The completed formula.
 */
export function getInitiativeFormula(formulaObj) {
    const {
        selectedDie = "1d12",
        modifier = 0,
        bonus = 0,
        round = 0,
        isTemplate = false,
    } = formulaObj;

    if (selectedDie === "immediate") {
        return String(Math.max(1, round));
    }

    const bonusTerm = isTemplate ? "+ @bonus.total.init" : getSignedTerm(bonus);
    const modTerm = Number(modifier) ? getSignedTerm(modifier) : "";
    const roundTerm = getSignedTerm(round);

    return `{${selectedDie} ${bonusTerm} ${modTerm}, 1}kh ${roundTerm}`;
}

