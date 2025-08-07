import { ProcessorAbstract } from "./processor-abstract.js";
import { CriticalProcessorSchema } from "./schema/critical-processor-schema.js";

export class CriticalProcessor extends ProcessorAbstract {
    static SCHEMA_CLASS = CriticalProcessorSchema;

    async run() {
        const formula = calculateCritFormula(this.schema);
        const severity = calculateCritSeverity(this.schema);

        const roll = (await new Roll(formula).evaluate()).toJSON();

        const resp = { ...this.schema.toObject(), severity };
        return { roll, resp };
    }
}

/**
 * Calculates a critical hit formula string based on attacker and defender sizes.
 *
 * @param {Object} [params={}] - The input parameters.
 * @param {number} [params.atkSize=0] - The size value of the attacker.
 * @param {number} [params.defSize=0] - The size value of the defender.
 * @returns {string} A string representing the dice formula for critical damage.
 */
export function calculateCritFormula({ atkSize, defSize } = {}) {
    const sizeDelta = (Number(atkSize) || 0) - (Number(defSize) || 0);
    const die = 1000 * (10 - (Math.abs(sizeDelta)));
    const mod = 1000 * Math.max(0, sizeDelta);
    return mod ? `1d${die} + ${mod}` : `1d${die}`;
}

/**
 * Calculates critical hit severity based on rolls and damage reduction.
 *
 * @param {Object} [params={}] - The input parameters.
 * @param {number} [params.atkRoll=0] - The attack roll value.
 * @param {number} [params.dmg=0] - The damage value.
 * @param {number} [params.defRoll=0] - The defense roll value.
 * @param {number} [params.dr=0] - The damage reduction value.
 * @param {number} [params.bonus=0] - A bonus severity modifier.
 * @returns {number} The severity of the critical hit.
 */
export function calculateCritSeverity({ atkRoll, dmg, defRoll, dr, bonus } = {}) {
    const attacker = (Number(atkRoll) || 0) + (Number(dmg) || 0);
    const defender = (Number(defRoll) || 0) + (Number(dr) || 0);
    const modifier = Number(bonus) || 0;
    const severity = parseInt(attacker + modifier - defender) || 0;
    return Math.max(severity, 0);
}
