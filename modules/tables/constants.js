export const SYSTEM_ID = "hackmaster5e";
export const SYSTEM_SOCKET = `system.${SYSTEM_ID}`;
export const systemPath = path => `systems/${SYSTEM_ID}/${path}`;

export const HM_ICON = {
    default: "icons/magic/symbols/question-stone-yellow.webp",
    currency: "icons/commodities/currency/coins-plain-stack-gold-yellow.webp",
};

// TODO: ITEM_STATE and itemstate are the same table.
export const HMCONST = {
    AFFIX: {
        TYPE: {
            UNDEF: 0,
            BUFF: 1,
            DEBUFF: 2,
            STATUS: 3,
            TALENT: 4,
        },
    },
    ARMOR: {
        SHIELD: {
            BUCKLER: 0,
            SMALL: 1,
            MEDIUM: 2,
            LARGE: 3,
            BODY: 4,
        },
        TYPE: {
            NONE: 0,
            SHIELD: 1,
            LIGHT: 2,
            MEDIUM: 3,
            HEAVY: 4,
        },
    },
    CARD_TYPE: {
        ROLL: 0,
        ALERT: 1,
        NOTE: 2,
    },
    CFX: {
        MODE: {
            ABILITY_BONUS: 0,
            GET_PROPERTY: 1,
        },
        OPT: {
            RAW: 0,
            BONUS: 1,
            MALUS: 2,
        },
    },
    CONTAINER: {
        MAX_DEPTH: 2,
        TYPE: {
            UNLIMITED: 0,
            WEIGHT: 1,
            QUANTITY: 2,
        },
    },
    DIE: {
        D20P: 0,
        D20PM4: 1,
        D12P: 2,
        D10P: 3,
        D8P: 4,
    },
    DMGFORM: {
        STD: 0b00000000,
        SHIELD: 0b00000001,
        RSTD: 0b00000010,
        SHIELDRSTD: 0b00000011,
        JAB: 0b00000100,
        SHIELDJAB: 0b00000101,
        BSTAB: 0b00001000,
        BSTABSHIELD: 0b00001001,
    },
    DMGTYPE: {
        CRUSHING: 0,
        HACKING: 1,
        PUNCTURING: 2,
    },
    DEFENSE: {
        DEFENSE0: 0,
        DEFENSE1: 1,
        DEFENSE2: 2,
        DEFENSE3: 3,
        DEFENSE4: 4,
    },
    ENCUMBRANCE: {
        NONE: 0,
        LIGHT: 1,
        MEDIUM: 2,
        HEAVY: 3,
        OVER: 4,
    },
    ITEM_STATE: {
        OWNED: 0,
        CARRIED: 1,
        EQUIPPED: 2,
        INNATE: 3,
    },
    FAME: {
        UNKNOWN: 0,
        OBSCURE: 1,
        LOCALPERSON: 2,
        MINORCELEB: 3,
        MAJORCELEB: 4,
        FAMOUS: 5,
        EPIC: 6,
    },
    HONOR: {
        NOTORIETY: 0,
        DISHONORABLE: 1,
        LOW: 2,
        AVERAGE: 3,
        GREAT: 4,
        LEGENDARY: 5,
    },
    MOVE: {
        CRAWL: 0,
        WALK: 1,
        JOG: 2,
        RUN: 3,
        SPRINT: 4,
    },
    MOVEACTION: {
        WALK: {
            WALK: 0,
            JOG: 1,
            RUN: 2,
            SPRINT: 3,
            OVER: 4,
        },
    },
    RANGED: {
        EMBED: {
            AUTO: -1,
            NONE: 0,
            SUPER: 1,
            EMBED: 2,
            D_EMBED: 3,
        },
        REACH: {
            MINIMUM: 0,
            SHORT: 1,
            MEDIUM: 2,
            LONG: 3,
            EXTREME: 4,
        },
        TIMER: {
            AIM: 0,
            LOAD: 1,
            RECOVER: 2,
            DRAW: 3,
            FIRE: 4,
        },
    },
    FORMULA_MOD: {
        STANDARD: 0,
        BACKSTAB: 1,
        DOUBLE: 2,
        NOPENETRATE: 3,
        HALVE: 4,
    },
    PRIORS: {
        SEX: {
            FEMALE: 0,
            MALE: 1,
        },
        BMI: {
            NORMAL: 0,
            OVER: 1,
            OBESE: 2,
        },
    },
    SAVE: {
        TYPE: {
            NONE: 0,
            SPECIAL: 1,
            PHYSICAL: 2,
            MENTAL: 3,
            DODGE: 4,
        },
        ACTION: {
            NEGATE: 0,
            HALF: 1,
            EVADE: 2,
            SPECIAL: 3,
        },
    },
    SCALE: {
        TINY: 1,
        SMALL: 2,
        MEDIUM: 3,
        LARGE: 4,
        HUGE: 5,
        GIGANTIC: 6,
        ENORMOUS: 7,
        COLOSSAL: 8,
    },
    SKILL: {
        DIFF: {
            AUTO: -1,
            VDIFFICULT: 0,
            DIFFICULT: 1,
            AVERAGE: 2,
            EASY: 3,
            TRIVIAL: 4,
        },
        FORM: {
            CHECK: 0,
            OPPOSED: 1,
        },
        MASTERY: {
            UNSKILLED: 0,
            NOVICE: 1,
            AVERAGE: 2,
            ADVANCED: 3,
            EXPERT: 4,
            MASTER: 5,
        },
        TYPE: {
            SKILL: "value",
            VERBAL: "verbal",
            WRITTEN: "literacy",
        },
    },
    SPECIAL: {
        STANDARD: 0b00000000,
        JAB: 0b00000001,
        BACKSTAB: 0b00000010,
        FLEEING: 0b00000011,
        FULLPARRY: 0b00000100,
        SET4CHARGE: 0b00000101,
        RESET: 0b00001000,
        AGGRESSIVE: 0b00010000,
        WITHDRAWL: 0b00010001,
        CHARGE: 0b00010010,
        CHARGE4: 0b00010010,
        CHARGE2: 0b00010011,
        RSTANDARD: 0b00100000,
        SNAPSHOT: 0b00100001,
        LOAD: 0b00100010,
        DRAW: 0b00100011,
        AIM: 0b00100100,
        DEFEND: 0b01000000,
        RDEFEND: 0b01000001,
        GGROUND: 0b01000010,
        SCAMPER: 0b01000011,
    },
    SVR: {
        NORMAL: 0,
        AMPED1: 1,
        AMPED2: 2,
        DANGER1: 3,
        DANGER2: 4,
        DANGER3: 5,
        DANGER4: 6,
    },
    TALENT: {
        WEAPON: 0,
        EFFECT: 1,
    },
    TRAUMA_FAILSTATE: {
        PASSED: 0,
        FAILED: 1,
        KO: 2,
        COMA: 3,
        VEGETABLE: 4,
    },
};

/**
 * This is like the textbook definition of an antipattern.
 *
 * @deprecated
 */
export const HMTABLES = {
    abilitymods: {
        clamp: {
            str: { min: 1.00, step: 0.5, max: 20.50 },
            int: { min: 1, step: 1, max: 20 },
            wis: { min: 1, step: 1, max: 20 },
            dex: { min: 3.00, step: 0.5, max: 20.50 },
            con: { min: 1, step: 1, max: 22 },
            lks: { min: 1, step: 1, max: 20 },
            cha: { min: 1, step: 1, max: 22 },
        },
        str: {
            0: { dmg: -7, fos: -14 },
            1: { dmg: -6, fos: -13 },
            2: { dmg: -6, fos: -12 },
            3: { dmg: -5, fos: -11 },
            4: { dmg: -5, fos: -10 },
            5: { dmg: -4, fos: -9 },
            6: { dmg: -4, fos: -9 },
            7: { dmg: -4, fos: -8 },
            8: { dmg: -3, fos: -7 },
            9: { dmg: -3, fos: -7 },
            10: { dmg: -3, fos: -6 },
            11: { dmg: -2, fos: -5 },
            12: { dmg: -2, fos: -5 },
            13: { dmg: -2, fos: -4 },
            14: { dmg: -1, fos: -3 },
            15: { dmg: -1, fos: -3 },
            16: { dmg: -1, fos: -2 },
            17: { dmg: -1, fos: -1 },
            18: { dmg: 0, fos: 0 },
            19: { dmg: 0, fos: 0 },
            20: { dmg: 0, fos: 0 },
            21: { dmg: 0, fos: 0 },
            22: { dmg: 1, fos: 1 },
            23: { dmg: 1, fos: 2 },
            24: { dmg: 1, fos: 3 },
            25: { dmg: 1, fos: 4 },
            26: { dmg: 2, fos: 5 },
            27: { dmg: 2, fos: 6 },
            28: { dmg: 2, fos: 7 },
            29: { dmg: 3, fos: 8 },
            30: { dmg: 3, fos: 9 },
            31: { dmg: 3, fos: 10 },
            32: { dmg: 4, fos: 11 },
            33: { dmg: 4, fos: 12 },
            34: { dmg: 4, fos: 13 },
            35: { dmg: 5, fos: 14 },
            36: { dmg: 5, fos: 15 },
            37: { dmg: 6, fos: 16 },
            38: { dmg: 6, fos: 17 },
            39: { dmg: 7, fos: 18 },
        },
        int: {
            0: { atk: -5 },
            1: { atk: -4 },
            2: { atk: -3 },
            3: { atk: -2 },
            4: { atk: -2 },
            5: { atk: -2 },
            6: { atk: -1 },
            7: { atk: -1 },
            8: { atk: -1 },
            9: { atk: 0 },
            10: { atk: 0 },
            11: { atk: 1 },
            12: { atk: 1 },
            13: { atk: 1 },
            14: { atk: 2 },
            15: { atk: 2 },
            16: { atk: 2 },
            17: { atk: 3 },
            18: { atk: 3 },
            19: { atk: 3 },
        },
        wis: {
            0: { init: 7, def: -4, mental: -4, ff: 3 },
            1: { init: 6, def: -3, mental: -4, ff: 3 },
            2: { init: 5, def: -3, mental: -3, ff: 2 },
            3: { init: 4, def: -2, mental: -3, ff: 2 },
            4: { init: 4, def: -2, mental: -2, ff: 2 },
            5: { init: 4, def: -2, mental: -2, ff: 1 },
            6: { init: 3, def: -1, mental: -1, ff: 1 },
            7: { init: 3, def: -1, mental: -1, ff: 1 },
            8: { init: 3, def: -1, mental: 0, ff: 0 },
            9: { init: 2, def: 0, mental: 0, ff: 0 },
            10: { init: 2, def: 0, mental: 0, ff: 0 },
            11: { init: 1, def: 1, mental: 0, ff: -1 },
            12: { init: 1, def: 1, mental: 1, ff: -1 },
            13: { init: 1, def: 1, mental: 1, ff: -1 },
            14: { init: 0, def: 2, mental: 2, ff: -2 },
            15: { init: 0, def: 2, mental: 2, ff: -2 },
            16: { init: 0, def: 2, mental: 2, ff: -2 },
            17: { init: -1, def: 3, mental: 3, ff: -3 },
            18: { init: -1, def: 3, mental: 3, ff: -3 },
            19: { init: -1, def: 3, mental: 3, ff: -3 },
            20: { init: -1, def: 3, mental: 3, ff: -4 },
            21: { init: -1, def: 3, mental: 3, ff: -4 },
        },
        dex: {
            0: { init: 7, atk: -4, def: -5, dodge: -3, foa: -10 },
            1: { init: 7, atk: -3, def: -5, dodge: -3, foa: -9 },
            2: { init: 6, atk: -3, def: -4, dodge: -3, foa: -9 },
            3: { init: 6, atk: -3, def: -4, dodge: -3, foa: -8 },
            4: { init: 6, atk: -3, def: -4, dodge: -2, foa: -7 },
            5: { init: 5, atk: -2, def: -3, dodge: -2, foa: -7 },
            6: { init: 5, atk: -2, def: -3, dodge: -2, foa: -6 },
            7: { init: 5, atk: -2, def: -3, dodge: -2, foa: -5 },
            8: { init: 4, atk: -2, def: -2, dodge: -1, foa: -5 },
            9: { init: 4, atk: -1, def: -2, dodge: -1, foa: -4 },
            10: { init: 4, atk: -1, def: -2, dodge: -1, foa: -3 },
            11: { init: 3, atk: -1, def: -1, dodge: -1, foa: -3 },
            12: { init: 3, atk: -1, def: -1, dodge: 0, foa: -2 },
            13: { init: 3, atk: 0, def: -1, dodge: 0, foa: -1 },
            14: { init: 2, atk: 0, def: 0, dodge: 0, foa: 0 },
            15: { init: 2, atk: 0, def: 0, dodge: 0, foa: 0 },
            16: { init: 2, atk: 0, def: 0, dodge: 0, foa: 0 },
            17: { init: 1, atk: 0, def: 1, dodge: 0, foa: 0 },
            18: { init: 1, atk: 1, def: 1, dodge: 0, foa: 1 },
            19: { init: 1, atk: 1, def: 1, dodge: 0, foa: 2 },
            20: { init: 0, atk: 1, def: 2, dodge: 1, foa: 3 },
            21: { init: 0, atk: 1, def: 2, dodge: 1, foa: 4 },
            22: { init: 0, atk: 2, def: 2, dodge: 1, foa: 5 },
            23: { init: -1, atk: 2, def: 3, dodge: 1, foa: 6 },
            24: { init: -1, atk: 2, def: 3, dodge: 2, foa: 7 },
            25: { init: -1, atk: 2, def: 3, dodge: 2, foa: 8 },
            26: { init: -2, atk: 3, def: 4, dodge: 2, foa: 9 },
            27: { init: -2, atk: 3, def: 4, dodge: 2, foa: 10 },
            28: { init: -2, atk: 3, def: 4, dodge: 2, foa: 11 },
            29: { init: -3, atk: 3, def: 5, dodge: 2, foa: 12 },
            30: { init: -3, atk: 4, def: 5, dodge: 3, foa: 13 },
            31: { init: -3, atk: 4, def: 5, dodge: 3, foa: 14 },
            32: { init: -4, atk: 4, def: 6, dodge: 3, foa: 15 },
            33: { init: -4, atk: 4, def: 6, dodge: 3, foa: 16 },
            34: { init: -4, atk: 5, def: 6, dodge: 3, foa: 17 },
            35: { init: -5, atk: 5, def: 7, dodge: 3, foa: 18 },
        },
        con: {
            0: { physical: -5, ff: 5 },
            1: { physical: -4, ff: 4 },
            2: { physical: -3, ff: 4 },
            3: { physical: -3, ff: 3 },
            4: { physical: -2, ff: 3 },
            5: { physical: -2, ff: 2 },
            6: { physical: -1, ff: 2 },
            7: { physical: -1, ff: 1 },
            8: { physical: 0, ff: 1 },
            9: { physical: 0, ff: 0 },
            10: { physical: 0, ff: -1 },
            11: { physical: 0, ff: -1 },
            12: { physical: 1, ff: -2 },
            13: { physical: 1, ff: -2 },
            14: { physical: 2, ff: -3 },
            15: { physical: 2, ff: -3 },
            16: { physical: 2, ff: -4 },
            17: { physical: 3, ff: -4 },
            18: { physical: 3, ff: -5 },
            19: { physical: 3, ff: -5 },
            20: { physical: 4, ff: -6 },
            21: { physical: 4, ff: -6 },
        },
        lks: {
            0: { chamod: -6 },
            1: { chamod: -5 },
            2: { chamod: -5 },
            3: { chamod: -4 },
            4: { chamod: -3 },
            5: { chamod: -2 },
            6: { chamod: -2 },
            7: { chamod: -1 },
            8: { chamod: -1 },
            9: { chamod: 0 },
            10: { chamod: 0 },
            11: { chamod: 0 },
            12: { chamod: 1 },
            13: { chamod: 1 },
            14: { chamod: 2 },
            15: { chamod: 2 },
            16: { chamod: 3 },
            17: { chamod: 4 },
            18: { chamod: 5 },
            19: { chamod: 6 },
        },
        cha: {
            0: { turning: -9, morale: -5 },
            1: { turning: -8, morale: -4 },
            2: { turning: -7, morale: -4 },
            3: { turning: -6, morale: -3 },
            4: { turning: -5, morale: -3 },
            5: { turning: -4, morale: -2 },
            6: { turning: -3, morale: -2 },
            7: { turning: -2, morale: -1 },
            8: { turning: -1, morale: -1 },
            9: { turning: 0, morale: 0 },
            10: { turning: 1, morale: 1 },
            11: { turning: 2, morale: 1 },
            12: { turning: 3, morale: 2 },
            13: { turning: 4, morale: 2 },
            14: { turning: 5, morale: 3 },
            15: { turning: 6, morale: 3 },
            16: { turning: 7, morale: 4 },
            17: { turning: 8, morale: 4 },
            18: { turning: 9, morale: 5 },
            19: { turning: 10, morale: 5 },
            20: { turning: 11, morale: 6 },
            21: { turning: 12, morale: 6 },
        },
        encumbrance: {
            0: [3, 5, 10, 15],
            1: [3, 6, 13, 20],
            2: [4, 8, 16, 24],
            3: [5, 9, 18, 27],
            4: [5, 10, 20, 30],
            5: [6, 11, 22, 33],
            6: [6, 12, 24, 36],
            7: [7, 13, 26, 39],
            8: [7, 15, 29, 44],
            9: [8, 16, 31, 47],
            10: [8, 16, 32, 48],
            11: [9, 17, 34, 51],
            12: [9, 18, 36, 54],
            13: [10, 19, 38, 57],
            14: [10, 20, 39, 59],
            15: [10, 20, 40, 60],
            16: [11, 21, 42, 63],
            17: [11, 22, 43, 65],
            18: [11, 22, 44, 66],
            19: [11, 23, 45, 68],
            20: [12, 24, 48, 72],
            21: [13, 26, 52, 78],
            22: [14, 28, 56, 84],
            23: [15, 31, 61, 92],
            24: [17, 33, 66, 99],
            25: [18, 36, 71, 107],
            26: [19, 39, 77, 116],
            27: [21, 42, 84, 126],
            28: [23, 46, 91, 137],
            29: [25, 50, 99, 149],
            30: [27, 54, 108, 162],
            31: [30, 59, 118, 177],
            32: [32, 65, 129, 194],
            33: [36, 71, 142, 213],
            34: [39, 78, 156, 234],
            35: [43, 86, 171, 257],
            36: [47, 95, 189, 284],
            37: [52, 105, 209, 314],
            38: [58, 116, 231, 347],
            39: [64, 128, 256, 384],
        },
    },
    beast: {
        tenacity: {
            0: { tenacity: null, tenacityCf: null },
            1: { tenacity: 2, tenacityCf: 0.500 },
            2: { tenacity: 1, tenacityCf: 0.400 },
            3: { tenacity: 0, tenacityCf: 0.250 },
            4: { tenacity: -4, tenacityCf: 0.200 },
            5: { tenacity: -8, tenacityCf: 0.001 },
        },
        int: {
            0: { sfc: 0 },
            1: { sfc: 1 },
            2: { sfc: 4 },
            3: { sfc: 5 },
            4: { sfc: 6 },
            5: { sfc: 9 },
            6: { sfc: 12 },
            7: { sfc: 14 },
            8: { sfc: 16 },
            9: { sfc: 18 },
            10: { sfc: 20 },
            11: { sfc: 22 },
            12: { sfc: 23 },
        },
    },
    cclass: {
        pData: {
            hp: { value: null, die: null, reroll: false },
            sp: { value: null },
            atk: { value: null },
            def: { value: null },
            spd: { value: null },
            spdm: { value: null },
            spdr: { value: null },
            init: { value: null },
            luck: { value: null },
        },
        epMax: {
            1: 400,
            2: 1200,
            3: 2200,
            4: 3400,
            5: 4850,
            6: 6600,
            7: 8700,
            8: 11200,
            9: 14150,
            10: 17600,
            11: 21650,
            12: 26400,
            13: 31950,
            14: 38400,
            15: 45850,
            16: 54400,
            17: 64150,
            18: 75200,
            19: 87650,
            20: 87650,
        },
    },
    currency: {
        standard: "sp",
        coins: {
            tc: { value: 1, weight: 0.0050 },
            cp: { value: 10, weight: 0.0125 },
            sp: { value: 100, weight: 0.0125 },
            gp: { value: 1000, weight: 0.0125 },
            pp: { value: 10000, weight: 0.0125 },
        },
    },
    encumbrance: {
        [HMCONST.ENCUMBRANCE.NONE]: { dr: 0, def: 0, init: 0, spd: 0, ff: 0 },
        [HMCONST.ENCUMBRANCE.LIGHT]: { dr: 0, def: -1, init: 0, spd: 0, ff: 1 },
        [HMCONST.ENCUMBRANCE.MEDIUM]: { dr: 1, def: -2, init: 1, spd: 1, ff: 3 },
        [HMCONST.ENCUMBRANCE.HEAVY]: { dr: 2, def: -4, init: 2, spd: 2, ff: 6 },
        [HMCONST.ENCUMBRANCE.OVER]: { dr: 4, def: -8, init: 4, spd: 4, ff: 6 },
    },
    formula: {
        atk: {
            [HMCONST.SPECIAL.STANDARD]: "d20p + @bonus.total.atk                      + @resp.bonus",
            [HMCONST.SPECIAL.AGGRESSIVE]: "d20p + @bonus.total.atk                  + 5 + @resp.bonus",
            [HMCONST.SPECIAL.CHARGE2]: "d20p + @bonus.total.atk                  + 2 + @resp.bonus",
            [HMCONST.SPECIAL.CHARGE4]: "d20p + @bonus.total.atk                  + 4 + @resp.bonus",
            [HMCONST.SPECIAL.WITHDRAWL]: "d20p + @bonus.total.atk                  - 2 + @resp.bonus",
            [HMCONST.SPECIAL.RSTANDARD]: "d20p + @bonus.total.atk - @resp.reachmod     + @resp.bonus",
            [HMCONST.SPECIAL.SNAPSHOT]: "d20p + @bonus.total.atk - @resp.reachmod - 6 + @resp.bonus",
        },
        dmg: {
            [HMCONST.DMGFORM.STD]: "@dmg.normal + @bonus.total.dmg                     + @resp.bonus",
            [HMCONST.DMGFORM.SHIELD]: "@dmg.shield + @bonus.total.dmg                     + @resp.bonus",
            [HMCONST.DMGFORM.RSTD]: "@dmg.normal + @derived.dmg                         + @resp.bonus",
            [HMCONST.DMGFORM.SHIELDRSTD]: "@dmg.shield + @derived.dmg                         + @resp.bonus",
            [HMCONST.DMGFORM.JAB]: "@jab.normal + @bonus.total.dmg                     + @resp.bonus",
            [HMCONST.DMGFORM.SHIELDJAB]: "@jab.shield + @bonus.total.dmg                     + @resp.bonus",
            [HMCONST.DMGFORM.BSTAB]: "@dmg.normal + @bonus.total.dmg + @bonus.total.back + @resp.bonus",
            [HMCONST.DMGFORM.BSTABSHIELD]: "@dmg.shield + @bonus.total.dmg + @bonus.total.back + @resp.bonus",
        },
        def: {
            [HMCONST.SPECIAL.DEFEND]: "@resp.defdie + @bonus.total.def + @resp.dodge     + @resp.bonus",
            [HMCONST.SPECIAL.RDEFEND]: "@resp.defdie                    + @resp.dodge     + @resp.bonus",
            [HMCONST.SPECIAL.SCAMPER]: "@resp.defdie + @bonus.total.def + @resp.dodge + 5 + @resp.bonus",
            [HMCONST.SPECIAL.GGROUND]: "@resp.defdie + @bonus.total.def + @resp.dodge + 5 + @resp.bonus",
        },
        save: {
            dodge: "d20p +  @bonus.total.dodge    + @resp.bonus",
            foa: "d20p +  @bonus.total.foa      + @resp.bonus",
            fos: "d20p +  @bonus.total.fos      + @resp.bonus",
            mental: "d20p +  @bonus.total.mental   + @resp.bonus",
            morale: "d20p +  @bonus.total.morale   + @resp.bonus",
            physical: "d20p +  @bonus.total.physical + @resp.bonus",
            poison: "d20p +  @bonus.total.poison   + @resp.bonus",
            tenacity: "d20p +  @bonus.total.tenacity + @resp.bonus",
            trauma: "@talent.die.trauma - (@bonus.total.trauma + @resp.bonus)",
            turning: "d20p +  @bonus.total.turning  + @resp.bonus",
            will: "d20p +  @bonus.total.will     + @resp.bonus",
        },
        spell: {
            baseroll: "d20p",
            save: "@baseroll + @bonus.total.slvl",
            sfc: "@baseroll + @bonus.total.sfc",
        },
        trauma: { comaCheck: "d20", comaDuration: "d20", koDuration: "5d6p" },
    },
    bracket: {
        fame: value => {
            const fTable = [0, 10, 20, 70, 100, 200, Infinity];
            return fTable.findIndex(x => x >= value);
        },
        honor: (level, value) => {
            const hTable = [0,
                3 + (level * 2),
                6 + (level * 4),
                10 + (level * 10),
                level > 5 ? 1 + (level * 14) : Infinity,
                Infinity,
            ];
            return hTable.findIndex(x => x >= value);
        },
        dishonor: () => ({
            atk: -1,
            def: -1,
            dmg: -1,
            spd: 1,
            init: 1,
            fos: -1,
            foa: -1,
            morale: -1,
            turning: -1,
            physical: -1,
            mental: -1,
            dodge: -1,
            trauma: -1,
            poison: -1,
            skills: -5,
        }),
    },
    cast: {
        baseSPC: lidx => (parseInt(lidx, 10) * 10) + 30,
        timing: (spd, caller) => {
            const { fatigue } = caller.system.bonus.total;
            const { basespd } = caller[SYSTEM_ID].talent.sfatigue;
            const declare = spd;
            const c = caller.itemTypes.cclass[0] ?? null;
            const fcast = c ? c.system.caps.fcast * 5 : 0;
            const sfatigue = Math.max(spd + basespd + fcast + (Number(fatigue) || 0), 1);
            return { declare, sfatigue };
        },
    },
    die: {
        [HMCONST.DIE.D20P]: "d20p",
        [HMCONST.DIE.D20PM4]: "d20p - 4",
        [HMCONST.DIE.D10P]: "d10p",
        [HMCONST.DIE.D12P]: "d12p",
        [HMCONST.DIE.D8P]: "d8p",
    },
    fatigue: {
        wound: hp => {
            if (hp.value === hp.max) return 0;
            const ratio = 1 - hp.value / hp.max;
            const idx = [0, 0.5, 0.9, Infinity].findIndex(m => m > ratio) - 1;
            const penalty = [1, 4, 8];
            return penalty[idx];
        },
    },
    movespd: {
        [HMCONST.MOVE.CRAWL]: 2.5,
        [HMCONST.MOVE.WALK]: 5.0,
        [HMCONST.MOVE.JOG]: 10.0,
        [HMCONST.MOVE.RUN]: 15.0,
        [HMCONST.MOVE.SPRINT]: 20.0,
    },
    quality: {
        armor: [1, 1, 0, 0],
        weapon: [1, 0, 1, 0],
        ranged: [0, 0, 1, 0],
    },
    scale: {
        [HMCONST.SCALE.TINY]: { hp: 0, kb: 5, reach: -2, token: 1, move: 1 / 3 },
        [HMCONST.SCALE.SMALL]: { hp: 5, kb: 10, reach: -1, token: 3, move: 1 / 2 },
        [HMCONST.SCALE.MEDIUM]: { hp: 10, kb: 15, reach: 0, token: 5, move: 1 },
        [HMCONST.SCALE.LARGE]: { hp: 15, kb: 20, reach: 1, token: 7, move: 2 },
        [HMCONST.SCALE.HUGE]: { hp: 20, kb: 25, reach: 2, token: 9, move: 3 },
        [HMCONST.SCALE.GIGANTIC]: { hp: 25, kb: 30, reach: 3, token: 11, move: 4 },
        [HMCONST.SCALE.ENORMOUS]: { hp: 35, kb: 40, reach: 5, token: 15, move: 6 },
        [HMCONST.SCALE.COLOSSAL]: { hp: 70, kb: 75, reach: 12, token: 29, move: 13 },
    },
    skill: {
        mastery: arg => [0, 25, 50, 75, 87, Infinity].findIndex(m => m >= arg),
    },
    spell: {
        mishap: (sfc, smc, save) => Math.clamp(sfc - save, 0, smc + 2),
        sfc: svr => {
            const svrClamped = Math.clamp(svr, 1, 244);
            return Math.ceil((svrClamped - 4) / 10) + 14;
        },
        smc: arg => [0, 10, 25, 40, 55, 76, 105, 145, Infinity].findIndex(m => m >= arg),
        svr: (lidx, stage) => {
            const level = lidx + 1;
            const sTable = [0 + Number(level),
            0 + (level * 2.5),
            0 + (level * 6),
            3 + (level * 7),
            7 + (level * 8),
            12 + (level * 9),
            18 + (level * 10),
            ];
            return Math.ceil(sTable[stage]);
        },
    },
    effects: {
        defense: {
            [HMCONST.DEFENSE.DEFENSE1]: "defense1",
            [HMCONST.DEFENSE.DEFENSE2]: "defense2",
            [HMCONST.DEFENSE.DEFENSE3]: "defense3",
            [HMCONST.DEFENSE.DEFENSE4]: "defense4",
        },
        exclusiveEffects: [
            "defense1",
            "defense2",
            "defense3",
            "defense4",
            "fullparry",
        ],
        statusEffects: {
            blind: {
                name: "EFFECT.StatusBlind",
                img: "icons/svg/blind.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "-8", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                    { key: "system.bonus.state.atk", value: "-8", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            defense1: {
                name: "EFFECT.defense1",
                img: "systems/hackmaster5e/styles/icons/swords-emblem1.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "1", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                    { key: "system.bonus.state.atk", value: "-2", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            defense2: {
                name: "EFFECT.defense2",
                img: "systems/hackmaster5e/styles/icons/swords-emblem2.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "2", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                    { key: "system.bonus.state.atk", value: "-4", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            defense3: {
                name: "EFFECT.defense3",
                img: "systems/hackmaster5e/styles/icons/swords-emblem3.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "3", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                    { key: "system.bonus.state.atk", value: "-6", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            defense4: {
                name: "EFFECT.defense4",
                img: "systems/hackmaster5e/styles/icons/swords-emblem4.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "4", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                    { key: "system.bonus.state.atk", value: "-8", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            aggressive: {
                name: "EFFECT.aggressive",
                img: "systems/hackmaster5e/styles/icons/saber-slash.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "-2", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            charge: {
                name: "EFFECT.charge",
                img: "systems/hackmaster5e/styles/icons/shield-bash.svg",
                changes: [{
                    key: "system.bonus.state.def",
                    value: [
                        HMCONST.CFX.MODE.ABILITY_BONUS,
                        "dex",
                        "def",
                        HMCONST.CFX.OPT.MALUS,
                    ],
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                },
                ],
            },
            fullparry: {
                name: "EFFECT.fullparry",
                img: "systems/hackmaster5e/styles/icons/sword-clash.svg",
                changes: [
                    { key: "system.bonus.state.def", value: "5", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            gground: {
                name: "EFFECT.gground",
                img: "systems/hackmaster5e/styles/icons/swordman.svg",
                changes: [
                    { key: "system.bonus.state.atk", value: "-1", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            scamper: {
                name: "EFFECT.scamper",
                img: "systems/hackmaster5e/styles/icons/dodging.svg",
                changes: [
                    { key: "system.bonus.state.atk", value: "-4", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            sfatigue: {
                name: "EFFECT.sfatigue",
                img: "systems/hackmaster5e/styles/icons/stoned-skull.svg",
                changes: [
                    {
                        key: "system.bonus.state.def",
                        value: [
                            HMCONST.CFX.MODE.GET_PROPERTY,
                            `${SYSTEM_ID}.talent.sfatigue.def`,
                        ],
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    },
                    { key: "system.bonus.state.skills", value: "-30", mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                ],
            },
            incap: {
                name: "EFFECT.incap",
                img: "systems/hackmaster5e/styles/icons/nailed-head.svg",
            },
        },
    },
    top: { character: 0.3, beast: 0.4 },
    weapons: {
        caps: {
            std: [
                HMCONST.SPECIAL.DEFEND,
                HMCONST.SPECIAL.RDEFEND,
                HMCONST.SPECIAL.GGROUND,
                HMCONST.SPECIAL.SCAMPER,
            ],
            melee: [
                HMCONST.SPECIAL.STANDARD,
                HMCONST.SPECIAL.FULLPARRY,
                HMCONST.SPECIAL.AGGRESSIVE,
                HMCONST.SPECIAL.WITHDRAWL,
                HMCONST.SPECIAL.CHARGE,
                HMCONST.SPECIAL.RESET,
            ],
            ranged: [
                HMCONST.SPECIAL.RSTANDARD,
                HMCONST.SPECIAL.SNAPSHOT,
                HMCONST.SPECIAL.LOAD,
                HMCONST.SPECIAL.DRAW,
                HMCONST.SPECIAL.AIM,
            ],
        },
        s4c: { spd: 3 },
        scale: {
            [HMCONST.SCALE.TINY]: { minspd: 1 },
            [HMCONST.SCALE.SMALL]: { minspd: 2 },
            [HMCONST.SCALE.MEDIUM]: { minspd: 3 },
            [HMCONST.SCALE.LARGE]: { minspd: 4 },
            [HMCONST.SCALE.HUGE]: { minspd: 5 },
            [HMCONST.SCALE.GIGANTIC]: { minspd: 6 },
            [HMCONST.SCALE.ENORMOUS]: { minspd: 8 },
            [HMCONST.SCALE.COLOSSAL]: { minspd: 15 },
        },
        ranged: {
            embed: arg => [0, 1, 3, 9, Infinity].findIndex(m => m > arg) - 1,
            reach: {
                [HMCONST.RANGED.REACH.SHORT]: 0,
                [HMCONST.RANGED.REACH.MEDIUM]: 4,
                [HMCONST.RANGED.REACH.LONG]: 6,
                [HMCONST.RANGED.REACH.EXTREME]: 8,
            },
            minspd: timing => {
                if (!timing) return 4;
                let minRoF = 0;
                Object.keys(timing).forEach(i => { if (timing[i]) minRoF++; });
                return minRoF;
            },
            timing: (timing, base) => {
                if (!timing) return { base, declare: base, shoot: 0 };

                const mod = (x, y) => ((x % y) + y) % y;

                const timerCascade = (t0, d0) => {
                    if ((Number(t0) || 0) < 1) return [0, d0];
                    const t1 = Math.max(t0 - d0, 1);
                    const d1 = Math.max(d0 - (t0 - t1), 0);
                    return [t1, d1];
                };

                const spd = Object.values(timing).reduce((a, b) => (a || 0) + (b || 0));
                const dt = spd - base;

                const adjArr = [];
                const timingOrder = ["aim", "load", "recover", "draw"];
                const tlength = timingOrder.length;
                for (let i = 0; i < tlength; i++) adjArr[i] = Math.ceil((dt - i) / tlength);

                const timingNew = foundry.utils.duplicate(timing);

                // We run through the array twice to ensure all possible bonuses are applied.
                for (let j = 2 * tlength - 1; j >= 0; j--) {
                    const jmod = mod(j, tlength);
                    const tCasc = timerCascade(timingNew[timingOrder[jmod]], adjArr[jmod]);
                    timingNew[timingOrder[jmod]] = tCasc[0];
                    adjArr[jmod] = 0;
                    adjArr[mod(j - 1, tlength)] += tCasc[1];
                }

                const declare = (timingNew.load || 0)
                    + (timingNew.draw || 0)
                    + (timingNew.aim || 0);

                const shoot = (timingNew.fire || 0)
                    + (timingNew.recover || 0);

                const specialMove = {
                    [HMCONST.SPECIAL.RSTANDARD]: declare,
                    [HMCONST.SPECIAL.SNAPSHOT]: (timingNew.draw + timingNew.load) || 0,
                    [HMCONST.SPECIAL.LOAD]: timingNew.load || 0,
                    [HMCONST.SPECIAL.DRAW]: timingNew.draw || 0,
                    [HMCONST.SPECIAL.AIM]: timingNew.aim || 0,
                };
                return { base, declare, shoot, ...specialMove };
            },
        },
        noProf: {
            skill: {
                minimal: -1,
                low: -2,
                medium: -4,
                high: -6,
            },
            weaponType: {
                melee: [1, 1, 1, -1],
                ranged: [1, 0, 0, -1],
            },
        },
    },
    weight: (bmi, height) => {
        const weight = (bmi * height ** 2) / 703;
        return Math.floor(weight);
    },
    itemstate: {
        0: "owned",
        1: "carried",
        2: "equipped",
        3: "innate",
    },
};
