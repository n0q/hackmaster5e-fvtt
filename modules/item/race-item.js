import { HMTABLES } from "../tables/constants.js";
import { HMItem } from "./item.js";
import { sanitizeForBasicObjectBinding, isValidBasicObjectBinding } from "../data/data-utils.js";

export class HMRaceItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();

        const { system } = this;
        const { bonus, scale } = system;
        const scaleTable = HMTABLES.scale;
        Object.keys(scale).forEach(key => {
            const idx = system.scale[key];
            if (idx > 0) bonus[key] = scaleTable[idx][key];
        });
    }

    get movespd() {
        const { move } = this.system.bonus || 1;
        return Object.values(HMTABLES.movespd).map(x => parseFloat((x * move).toPrecision(3)));
    }

    getScale(key) {
        const { scale, bonus } = this.system;
        if (key in scale === false) return undefined;
        const scaleRef = Number(scale[key]);
        if (scaleRef) return scaleRef;

        // Custom bonus requires best-fit for category.
        const scaleBonus = Number(bonus[key]);
        const scaleTable = HMTABLES.scale;
        const scaleList = Object.keys(scaleTable).map(x => scaleTable[x][key]);
        scaleList[scaleList.length - 1] = Infinity;

        return scaleList.findIndex(x => scaleBonus <= Number(x)) + 1;
    }

    /**
     * Generates a bob for a race item.
     *
     * Handles complex race names that may include parenthetical subrace information:
     * - Simple races: "Human" to "race:human"
     * - Reared subraces:
     *   - "Half-Elf (Human Reared)" to "race:half-elf_human"
     *   - "Half-Elf (Human)" to "race:half-elf_human"
     *
     * Falls back to the standard bob generation if no parenthetical subrace is found.
     *
     * @override
     * @returns {string} The generated bob.
     * @throws {Error} If the generated bob is invalid.
     */
    _generateBasicObjectBinding() {
        const superBob = super._generateBasicObjectBinding();
        const matches = splitRaceName(this.name);

        if (!matches) {
            return superBob;
        }

        const bobName = sanitizeForBasicObjectBinding(matches.race);
        const bobSubname = sanitizeForBasicObjectBinding(matches.subRace);
        const bob = `${this.type}:${bobName}_${bobSubname}`;

        if (isValidBasicObjectBinding(bob, this.type)) {
            return bob;
        }

        throw new Error(`Invalid Bob: '${bob}'.`);
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }
}
/**
 * Parses a race name to extract the primary race and subrace components.
 *
 * Supports two parenthetical formats commonly found in RPG race names:
 * 1. Reared format: "Race (Subrace Reared)" - indicates cultural upbringing
 * 2. Standard format: "Race (Subrace)" - indicates lineage or variant
 *
 * @param {string} str - The race name to parse
 * @returns {Object|null} Parsed race components, or null if no parenthetical found
 * @returns {string} returns.race - The primary race name (trimmed)
 * @returns {string} returns.subRace - The subrace/variant name (trimmed, "Reared" suffix removed)
 */
function splitRaceName(str) {
    // "[race] ([subrace] Reared)"
    let match = str.match(/^([^(]+?)\s*\(([^)]+?)\s*Reared\)$/i);
    if (match) {
        return {
            race: match[1].trim(),
            subRace: match[2].trim(),
        };
    }

    // "[race] ([subrace])"
    match = str.match(/^([^(]+?)\s*\(([^)]+?)\)$/);
    if (match) {
        return {
            race: match[1].trim(),
            subRace: match[2].trim(),
        };
    }

    return null;
}
