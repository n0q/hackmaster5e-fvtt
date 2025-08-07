import { ProcessorAbstract } from "./processor-abstract.js";
import { FumbleProcessorSchema } from "./schema/fumble-processor-schema.js";

// DO NOT OPEN THIS FILE
// THERE IS NO LOGIC HERE, ONLY PAIN
// These are literal transcriptions of game manual tables
// Treat as immutable data from an external source
//
//
// DO NOT TAUNT HAPPY FUN BALL.

/**
 * Constants for fumble processing.
 * @enum {number}
 */
const FUMBLE = {
    TYPE: {
        MELEE: 0,
        RANGED: 1
    },
    COMPLICATION: {
        NONE: 0,
        STRAIN: 1,
        SPRAIN: 2,
    },
    // Special handling for innate attacks.
    INNATE_OVERRIDE: {
        MELEE: { START: 11, END: 20, REPLACEMENT: 99 },
        RANGED: { START: 10, END: 15, REPLACEMENT: 99 }
    },
    // Index ranges that trigger complications.
    COMPLICATION_RANGES: {
        MELEE: {
            STRAIN: { START: 26, END: 45 },
            SPRAIN: { START: 46, END: 63 }
        },
        RANGED: {
            STRAIN: { START: 21, END: 28 },
            SPRAIN: { START: 29, END: 36 }
        }
    }
};

/**
 * Lookup tables for fumble results.
 * Each array contains threshold values for d1000 rolls.
 * The index where the roll meets/exceeds the threshold determines the fumble result.
 */
const FUMBLE_TABLES = {
    roll: {
        [FUMBLE.TYPE.MELEE]: [
            200, 216, 232, 247, 263, 276, 318, 343, 364, 370,
            398, 436, 472, 508, 517, 526, 535, 553, 571, 580,
            616, 630, 644, 658, 672, 688, 690, 692, 694, 696,
            698, 700, 702, 704, 706, 708, 710, 712, 714, 716,
            718, 720, 727, 724, 726, 728, 730, 732, 735, 738,
            740, 742, 744, 746, 748, 751, 759, 761, 766, 768,
            770, 771, 773, 774, 864, 941, 964, 982, 995, 1004,
            1010, 1015, 1020, 1024, 1028, 1031, 1034, 1037, 1039, 1041,
            1100, 1200, Infinity,
        ],
        [FUMBLE.TYPE.RANGED]: [
            200, 216, 232, 247, 263, 276, 318, 343, 364, 370,
            436, 508, 562, 580, 589, 616, 630, 644, 658, 672,
            686, 694, 698, 704, 708, 712, 716, 722, 728, 733,
            738, 743, 748, 753, 763, 768, 744, 864, 941, 964,
            982, 1044, 1100, 1200, Infinity,
        ],
    },
    type: {
        [FUMBLE.TYPE.MELEE]: [200, 263, 398, 436, 616, 688, 774, 864, 1044, 1100, 1200, Infinity],
        [FUMBLE.TYPE.RANGED]: [200, 263, 398, 616, 688, 774, 864, 995, 1044, 1100, 1200, Infinity],
    }
};

export class FumbleProcessor extends ProcessorAbstract {
    static SCHEMA_CLASS = FumbleProcessorSchema;

    async run() {
        const formula = calculateFumbleFormula(this.schema);
        if (!formula) return;

        const roll = await this.#evaluateRoll(formula);
        const fumbleType = this.#getFumbleType();

        const indices = this.#findTableIndices(roll.total, fumbleType);
        const adjustedRollIdx = this.#adjustForInnateAttack(indices.rollIdx, fumbleType);
        const complication = this.#determineComplication(adjustedRollIdx, fumbleType);

        const mdata = {
            typeIdx: indices.typeIdx,
            rollIdx: adjustedRollIdx,
            complication,
        };

        const batch = [roll.toJSON()];
        if (complication) {
            const complicationRoll = await this.#evaluateRoll("1d6");
            batch.push(complicationRoll.toJSON());
        }

        // return { batch, mdata, resp: this.schema.toObject() };
        return { batch, mdata, resp: this.schema };
    }

    #evaluateRoll(formula) {
        return new Roll(formula).evaluate();
    }

    #getFumbleType() {
        return this.schema.isRanged ? FUMBLE.TYPE.RANGED : FUMBLE.TYPE.MELEE;
    }

    #findTableIndices(rollTotal, fumbleType) {
        return {
            rollIdx: this.#findIndexInTable(rollTotal, FUMBLE_TABLES.roll[fumbleType]),
            typeIdx: this.#findIndexInTable(rollTotal, FUMBLE_TABLES.type[fumbleType])
        };
    }

    #findIndexInTable(rollTotal, table) {
        return table.findIndex(threshold => threshold >= rollTotal);
    }

    #adjustForInnateAttack(rollIdx, fumbleType) {
        if (!this.schema.isInnate) return rollIdx;

        const range = fumbleType === FUMBLE.TYPE.MELEE
            ? FUMBLE.INNATE_OVERRIDE.MELEE
            : FUMBLE.INNATE_OVERRIDE.RANGED;

        const isInOverrideRange = rollIdx > range.START && rollIdx <= range.END;
        return isInOverrideRange ? range.REPLACEMENT : rollIdx;
    }

    #determineComplication(rollIdx, fumbleType) {
        const ranges = fumbleType === FUMBLE.TYPE.MELEE
            ? FUMBLE.COMPLICATION_RANGES.MELEE
            : FUMBLE.COMPLICATION_RANGES.RANGED;

        if (this.#isInRange(rollIdx, ranges.STRAIN)) {
            return FUMBLE.COMPLICATION.STRAIN;
        }
        if (this.#isInRange(rollIdx, ranges.SPRAIN)) {
            return FUMBLE.COMPLICATION.SPRAIN;
        }
        return FUMBLE.COMPLICATION.NONE;
    }

    #isInRange(value, range) {
        return value > range.START && value <= range.END;
    }
}

/**
 * Calculates a fumble formula string based on attack and defense values.
 *
 * @param {Object} [params={}] - The input parameters.
 * @param {number} [params.atk=0] - The attack value.
 * @param {number} [params.def=0] - The defense value.
 * @returns {string} A string representing the dice formula for the fumble.
 */
export function calculateFumbleFormula({ atk = 0, def = 0 } = {}) {
    const modDelta = Math.max(0, def - atk);
    const modifier = 10 * modDelta;
    return modifier ? `d1000 + ${modifier}` : undefined;
}
