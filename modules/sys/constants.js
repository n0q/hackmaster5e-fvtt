/* eslint no-shadow: ["error", {"allow": ["HMCONST", "HMTABLES]}] */
export const MODULE_ID = 'hackmaster5e';

// TODO: ITEM_STATE and itemstate are the same table.
export const HMCONST = {
    DEFAULT_ICON: 'icons/magic/symbols/question-stone-yellow.webp',
    CARD_TYPE: {
        ROLL:  0,
        ALERT: 1,
        NOTE:  2,
    },
    C_EFFECT_TYPE: {
        NO_DEXDEF: 0,
    },
    DIE: {
        D20P:   0,
        D20PM4: 1,
        D12P:   2,
        D8P:    3,
    },
    DMGTYPE: {
        CRUSHING:   0,
        HACKING:    1,
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
        NONE:     0,
        LIGHT:    1,
        MEDIUM:   2,
        HEAVY:    3,
    },
    ITEM_STATE: {
        OWNED:    0,
        CARRIED:  1,
        EQUIPPED: 2,
        INNATE:   3,
    },
    FAME: {
        UNKNOWN:     0,
        OBSCURE:     1,
        LOCALPERSON: 2,
        MINORCELEB:  3,
        MAJORCELEB:  4,
        FAMOUS:      5,
        EPIC:        6,
    },
    HONOR: {
        NOTORIETY:    0,
        DISHONORABLE: 1,
        LOW:          2,
        AVERAGE:      3,
        GREAT:        4,
        LEGENDARY:    5,
    },
    MOVE: {
        CRAWL:  0,
        WALK:   1,
        JOG:    2,
        RUN:    3,
        SPRINT: 4,
    },
    RANGED: {
        REACH: {
            MINIMUM: 0,
            SHORT:   1,
            MEDIUM:  2,
            LONG:    3,
            EXTREME: 4,
        },
        TIMER: {
            AIM:     0,
            LOAD:    1,
            RECOVER: 2,
            DRAW:    3,
            FIRE:    4,
        },
    },
    FORMULA_MOD: {
        STANDARD:       0,
        BACKSTAB:       1,
        DOUBLE:         2,
        NOPENETRATE:    3,
        HALVE:          4,
    },
    SCALE: {
        TINY:     1,
        SMALL:    2,
        MEDIUM:   3,
        LARGE:    4,
        HUGE:     5,
        GIGANTIC: 6,
        ENORMOUS: 7,
        COLOSSAL: 8,
    },
    SPECIAL: {
        STANDARD:    0,
        JAB:         1,
        BACKSTAB:    2,
        FLEEING:     3,
        FULLPARRY:   4,
        SET4CHARGE:  5,
        AGGRESSIVE: 16,
        WITHDRAWL:  17,
        CHARGE:     18,
        CHARGE4:    18,
        CHARGE2:    19,
        RSTANDARD:  32,
        DEFEND:     64,
        RDEFEND:    65,
        GGROUND:    66,
        SCAMPER:    67,
    },
};

// system rules
export const HMTABLES = {
    abilitymods: {
        clamp: {
            str: { min: 1.01, step: 0.5, max: 20.51 },
            int: { min: 1,    step: 1,   max: 20    },
            wis: { min: 1,    step: 1,   max: 20    },
            dex: { min: 3.01, step: 0.5, max: 20.51 },
            con: { min: 1,    step: 1,   max: 22    },
            lks: { min: 1,    step: 1,   max: 20    },
            cha: { min: 1,    step: 1,   max: 22    },
        },
        str: {
            0:  { dmg: -7, fos: -14 },
            1:  { dmg: -6, fos: -13 },
            2:  { dmg: -6, fos: -12 },
            3:  { dmg: -5, fos: -11 },
            4:  { dmg: -5, fos: -10 },
            5:  { dmg: -4, fos:  -9 },
            6:  { dmg: -4, fos:  -9 },
            7:  { dmg: -4, fos:  -8 },
            8:  { dmg: -3, fos:  -7 },
            9:  { dmg: -3, fos:  -7 },
            10: { dmg: -3, fos:  -6 },
            11: { dmg: -2, fos:  -5 },
            12: { dmg: -2, fos:  -5 },
            13: { dmg: -2, fos:  -4 },
            14: { dmg: -1, fos:  -3 },
            15: { dmg: -1, fos:  -3 },
            16: { dmg: -1, fos:  -2 },
            17: { dmg: -1, fos:  -1 },
            18: { dmg:  0, fos:   0 },
            19: { dmg:  0, fos:   0 },
            20: { dmg:  0, fos:   0 },
            21: { dmg:  0, fos:   0 },
            22: { dmg:  1, fos:   1 },
            23: { dmg:  1, fos:   2 },
            24: { dmg:  1, fos:   3 },
            25: { dmg:  1, fos:   4 },
            26: { dmg:  2, fos:   5 },
            27: { dmg:  2, fos:   6 },
            28: { dmg:  2, fos:   7 },
            29: { dmg:  3, fos:   8 },
            30: { dmg:  3, fos:   9 },
            31: { dmg:  3, fos:  10 },
            32: { dmg:  4, fos:  11 },
            33: { dmg:  4, fos:  12 },
            34: { dmg:  4, fos:  13 },
            35: { dmg:  5, fos:  14 },
            36: { dmg:  5, fos:  15 },
            37: { dmg:  6, fos:  16 },
            38: { dmg:  6, fos:  17 },
            39: { dmg:  7, fos:  18 },
        },
        int: {
            0:  { atk: -5 },
            1:  { atk: -4 },
            2:  { atk: -3 },
            3:  { atk: -2 },
            4:  { atk: -2 },
            5:  { atk: -2 },
            6:  { atk: -1 },
            7:  { atk: -1 },
            8:  { atk: -1 },
            9:  { atk:  0 },
            10: { atk:  0 },
            11: { atk:  1 },
            12: { atk:  1 },
            13: { atk:  1 },
            14: { atk:  2 },
            15: { atk:  2 },
            16: { atk:  2 },
            17: { atk:  3 },
            18: { atk:  3 },
            19: { atk:  3 },
        },
        wis: {
            0:  { init:  7, def: -4, mental: -4 },
            1:  { init:  6, def: -3, mental: -4 },
            2:  { init:  5, def: -3, mental: -3 },
            3:  { init:  4, def: -2, mental: -3 },
            4:  { init:  4, def: -2, mental: -2 },
            5:  { init:  4, def: -2, mental: -2 },
            6:  { init:  3, def: -1, mental: -1 },
            7:  { init:  3, def: -1, mental: -1 },
            8:  { init:  3, def: -1, mental:  0 },
            9:  { init:  2, def:  0, mental:  0 },
            10: { init:  2, def:  0, mental:  0 },
            11: { init:  1, def:  1, mental:  0 },
            12: { init:  1, def:  1, mental:  1 },
            13: { init:  1, def:  1, mental:  1 },
            14: { init:  0, def:  2, mental:  2 },
            15: { init:  0, def:  2, mental:  2 },
            16: { init:  0, def:  2, mental:  2 },
            17: { init: -1, def:  3, mental:  3 },
            18: { init: -1, def:  3, mental:  3 },
            19: { init: -1, def:  3, mental:  3 },
        },
        dex: {
            0:  { init:  7, atk: -4, def: -5, dodge: -3, foa: -10 },
            1:  { init:  7, atk: -3, def: -5, dodge: -3, foa:  -9 },
            2:  { init:  6, atk: -3, def: -4, dodge: -3, foa:  -9 },
            3:  { init:  6, atk: -3, def: -4, dodge: -3, foa:  -8 },
            4:  { init:  6, atk: -3, def: -4, dodge: -2, foa:  -7 },
            5:  { init:  5, atk: -2, def: -3, dodge: -2, foa:  -7 },
            6:  { init:  5, atk: -2, def: -3, dodge: -2, foa:  -6 },
            7:  { init:  5, atk: -2, def: -3, dodge: -2, foa:  -5 },
            8:  { init:  4, atk: -2, def: -2, dodge: -1, foa:  -5 },
            9:  { init:  4, atk: -1, def: -2, dodge: -1, foa:  -4 },
            10: { init:  4, atk: -1, def: -2, dodge: -1, foa:  -3 },
            11: { init:  3, atk: -1, def: -1, dodge: -1, foa:  -3 },
            12: { init:  3, atk: -1, def: -1, dodge:  0, foa:  -2 },
            13: { init:  3, atk:  0, def: -1, dodge:  0, foa:  -1 },
            14: { init:  2, atk:  0, def:  0, dodge:  0, foa:   0 },
            15: { init:  2, atk:  0, def:  0, dodge:  0, foa:   0 },
            16: { init:  2, atk:  0, def:  0, dodge:  0, foa:   0 },
            17: { init:  1, atk:  0, def:  1, dodge:  0, foa:   0 },
            18: { init:  1, atk:  1, def:  1, dodge:  0, foa:   1 },
            19: { init:  1, atk:  1, def:  1, dodge:  0, foa:   2 },
            20: { init:  0, atk:  1, def:  2, dodge:  1, foa:   3 },
            21: { init:  0, atk:  1, def:  2, dodge:  1, foa:   4 },
            22: { init:  0, atk:  2, def:  2, dodge:  1, foa:   5 },
            23: { init: -1, atk:  2, def:  3, dodge:  1, foa:   6 },
            24: { init: -1, atk:  2, def:  3, dodge:  2, foa:   7 },
            25: { init: -1, atk:  2, def:  3, dodge:  2, foa:   8 },
            26: { init: -2, atk:  3, def:  4, dodge:  2, foa:   9 },
            27: { init: -2, atk:  3, def:  4, dodge:  2, foa:  10 },
            28: { init: -2, atk:  3, def:  4, dodge:  2, foa:  11 },
            29: { init: -3, atk:  3, def:  5, dodge:  2, foa:  12 },
            30: { init: -3, atk:  4, def:  5, dodge:  3, foa:  13 },
            31: { init: -3, atk:  4, def:  5, dodge:  3, foa:  14 },
            32: { init: -4, atk:  4, def:  6, dodge:  3, foa:  15 },
            33: { init: -4, atk:  4, def:  6, dodge:  3, foa:  16 },
            34: { init: -4, atk:  5, def:  6, dodge:  3, foa:  17 },
            35: { init: -5, atk:  5, def:  7, dodge:  3, foa:  18 },
        },
        con: {
            0:  { physical: -5 },
            1:  { physical: -4 },
            2:  { physical: -3 },
            3:  { physical: -3 },
            4:  { physical: -2 },
            5:  { physical: -2 },
            6:  { physical: -1 },
            7:  { physical: -1 },
            8:  { physical:  0 },
            9:  { physical:  0 },
            10: { physical:  0 },
            11: { physical:  0 },
            12: { physical:  1 },
            13: { physical:  1 },
            14: { physical:  2 },
            15: { physical:  2 },
            16: { physical:  2 },
            17: { physical:  3 },
            18: { physical:  3 },
            19: { physical:  3 },
            20: { physical:  4 },
            21: { physical:  4 },
        },
        lks: {
            0:  { chamod: -6 },
            1:  { chamod: -5 },
            2:  { chamod: -5 },
            3:  { chamod: -4 },
            4:  { chamod: -3 },
            5:  { chamod: -2 },
            6:  { chamod: -2 },
            7:  { chamod: -1 },
            8:  { chamod: -1 },
            9:  { chamod:  0 },
            10: { chamod:  0 },
            11: { chamod:  0 },
            12: { chamod:  1 },
            13: { chamod:  1 },
            14: { chamod:  2 },
            15: { chamod:  2 },
            16: { chamod:  3 },
            17: { chamod:  4 },
            18: { chamod:  5 },
            19: { chamod:  6 },
        },
        cha: {
            0:  { turning: -9, morale: -5 },
            1:  { turning: -8, morale: -4 },
            2:  { turning: -7, morale: -4 },
            3:  { turning: -6, morale: -3 },
            4:  { turning: -5, morale: -3 },
            5:  { turning: -4, morale: -2 },
            6:  { turning: -3, morale: -2 },
            7:  { turning: -2, morale: -1 },
            8:  { turning:  1, morale: -1 },
            9:  { turning:  0, morale:  0 },
            10: { turning:  1, morale:  1 },
            11: { turning:  2, morale:  1 },
            12: { turning:  3, morale:  2 },
            13: { turning:  4, morale:  2 },
            14: { turning:  5, morale:  3 },
            15: { turning:  6, morale:  3 },
            16: { turning:  7, morale:  4 },
            17: { turning:  8, morale:  4 },
            18: { turning:  9, morale:  5 },
            19: { turning: 10, morale:  5 },
            20: { turning: 11, morale:  6 },
            21: { turning: 12, morale:  6 },
        },
        encumbrance: {
            0:  [3,    5,  10,  15],
            1:  [3,    6,  13,  20],
            2:  [4,    8,  16,  24],
            3:  [5,    9,  18,  27],
            4:  [5,   10,  20,  30],
            5:  [6,   11,  22,  33],
            6:  [6,   12,  24,  36],
            7:  [7,   13,  26,  39],
            8:  [7,   15,  29,  44],
            9:  [8,   16,  31,  47],
            10: [8,   16,  32,  48],
            11: [9,   17,  34,  51],
            12: [9,   18,  36,  54],
            13: [10,  19,  38,  57],
            14: [10,  20,  39,  59],
            15: [10,  20,  40,  60],
            16: [11,  21,  42,  63],
            17: [11,  22,  43,  65],
            18: [11,  22,  44,  66],
            19: [11,  23,  45,  68],
            20: [12,  24,  48,  72],
            21: [13,  26,  52,  78],
            22: [14,  28,  56,  84],
            23: [15,  31,  61,  92],
            24: [17,  33,  66,  99],
            25: [18,  36,  71, 107],
            26: [19,  39,  77, 116],
            27: [21,  42,  84, 126],
            28: [23,  46,  91, 137],
            29: [25,  50,  99, 149],
            30: [27,  54, 108, 162],
            31: [30,  59, 118, 177],
            32: [32,  65, 129, 194],
            33: [36,  71, 142, 213],
            34: [39,  78, 156, 234],
            35: [43,  86, 171, 257],
            36: [47,  95, 189, 284],
            37: [52, 105, 209, 314],
            38: [58, 116, 231, 347],
            39: [64, 128, 256, 384],
        },
    },
    'cclass': {
        'pData': {
            'hp':   {value: null, die: null, reroll: false},
            'sp':   {value: null},
            'atk':  {value: null},
            'spd':  {value: null},
            'spdm': {value: null},
            'spdr': {value: null},
            'init': {value: null},
            'luck': {value: null},
        },
    },
    encumbrance: {
        [HMCONST.ENCUMBRANCE.NONE]:     {dr: 0, def:  0, init: 0, spd: 0},
        [HMCONST.ENCUMBRANCE.LIGHT]:    {dr: 0, def: -1, init: 0, spd: 0},
        [HMCONST.ENCUMBRANCE.MEDIUM]:   {dr: 1, def: -2, init: 1, spd: 1},
        [HMCONST.ENCUMBRANCE.HEAVY]:    {dr: 2, def: -4, init: 2, spd: 2},
    },
    formula: {
        atk: {
            [HMCONST.SPECIAL.STANDARD]:   'd20p + @bonus.total.atk +     @resp.bonus',
            [HMCONST.SPECIAL.AGGRESSIVE]: 'd20p + @bonus.total.atk + 5 + @resp.bonus',
            [HMCONST.SPECIAL.CHARGE2]:    'd20p + @bonus.total.atk + 2 + @resp.bonus',
            [HMCONST.SPECIAL.CHARGE4]:    'd20p + @bonus.total.atk + 4 + @resp.bonus',
            [HMCONST.SPECIAL.WITHDRAWL]:  'd20p + @bonus.total.atk - 2 + @resp.bonus',
            [HMCONST.SPECIAL.RSTANDARD]:  'd20p + @bonus.total.atk - @resp.reachmod + @resp.bonus',
        },
        'dmg': {
            'standard':    '@dmg.normal + @bonus.total.dmg + @resp.bonus',
            'shield':      '@dmg.shield + @bonus.total.dmg + @resp.bonus',
            'jab':         '@jab.normal + @bonus.total.dmg + @resp.bonus',
            'shieldjab':   '@jab.shield + @bonus.total.dmg + @resp.bonus',
            'bstab':       '@dmg.normal + @bonus.total.dmg + @actorbonus.total.back + @resp.bonus',
            'shieldbstab': '@dmg.shield + @bonus.total.dmg + @actorbonus.total.back + @resp.bonus',
        },
        def: {
            [HMCONST.SPECIAL.DEFEND]:  '@resp.defdie + @bonus.total.def     + @resp.bonus',
            [HMCONST.SPECIAL.RDEFEND]: '@resp.defdie                        + @resp.bonus',
            [HMCONST.SPECIAL.SCAMPER]: '@resp.defdie + @bonus.total.def + 5 + @resp.bonus',
            [HMCONST.SPECIAL.GGROUND]: '@resp.defdie + @bonus.total.def + 5 + @resp.bonus',
        },
        ratk: {
            [HMCONST.SPECIAL.STANDARD]: 'd20p + @bonus.total.atk - @resp.reachmod + @resp.bonus',
        },
        'save': {
            'dodge':    'd20p +  @bonus.total.dodge    + @resp.bonus',
            'foa':      'd20p +  @bonus.total.foa      + @resp.bonus',
            'fos':      'd20p +  @bonus.total.fos      + @resp.bonus',
            'mental':   'd20p +  @bonus.total.mental   + @resp.bonus',
            'morale':   'd20p +  @bonus.total.morale   + @resp.bonus',
            'physical': 'd20p +  @bonus.total.physical + @resp.bonus',
            'poison':   'd20p +  @bonus.total.poison   + @resp.bonus',
            'tenacity': 'd20p +  @bonus.total.tenacity + @resp.bonus',
            'trauma':   'd20  - (@bonus.total.trauma   + @resp.bonus)',
            'turning':  'd20p +  @bonus.total.turning  + @resp.bonus',
        },
        'skill': {
            'skill':    'd100 - (@resp.bonus + @bonus.total.value)',
            'opposed':  'd100 + (@resp.bonus + @bonus.total.value)',
            'language': 'd100 - (@resp.bonus + @bonus.total.verbal)',
            'literacy': 'd100 - (@resp.bonus + @bonus.total.literacy)',
        },
    },
    'bracket': {
        'fame': (value) => {
            const fTable = [0, 10, 20, 70, 100, 200, Infinity];
            return fTable.findIndex((x) => x >= value);
        },
        'honor': (level, value) => {
            const hTable = [0,
                            3 + level * 2,
                            6 + level * 4,
                           10 + level * 10,
                level > 5 ? 1 + level * 14: Infinity,
                                            Infinity,
            ];
            return hTable.findIndex((x) => x >= value);
       },
    },
    'cast': {
        'timing': (spd, caller) => {
            const {fatigue} = caller.system.bonus.total;
            const declare = spd;
            const cast = Math.max(spd + 5 + (Number(fatigue) || 0), 1);
            return {declare, cast};
        },
        'cost': (lidx, prepped) => {
            const base = (lidx * 10) + 30;
            return prepped ? base : base * 2;
        },
    },
    die: {
        [HMCONST.DIE.D20P]:     'd20p',
        [HMCONST.DIE.D20PM4]:   'd20p - 4',
        [HMCONST.DIE.D12P]:     'd12p',
        [HMCONST.DIE.D8P]:      'd8p',
    },
    'movespd': {
        [HMCONST.MOVE.CRAWL]:   2.5,
        [HMCONST.MOVE.WALK]:    5.0,
        [HMCONST.MOVE.JOG]:    10.0,
        [HMCONST.MOVE.RUN]:    15.0,
        [HMCONST.MOVE.SPRINT]: 20.0,
    },
    'quality': {
        'armor':  [1, 1, 0, 0],
        'weapon': [1, 0, 1, 0],
        'ranged': [1, 0, 0, 0],
    },
    scale: {
        [HMCONST.SCALE.TINY]:     {hp:  0, kb:  5, reach: -2,  move: 1/3},
        [HMCONST.SCALE.SMALL]:    {hp:  5, kb: 10, reach: -1,  move: 1/2},
        [HMCONST.SCALE.MEDIUM]:   {hp: 10, kb: 15, reach:  0,  move:   1},
        [HMCONST.SCALE.LARGE]:    {hp: 15, kb: 20, reach:  1,  move:   2},
        [HMCONST.SCALE.HUGE]:     {hp: 20, kb: 25, reach:  2,  move:   3},
        [HMCONST.SCALE.GIGANTIC]: {hp: 25, kb: 30, reach:  3,  move:   4},
        [HMCONST.SCALE.ENORMOUS]: {hp: 35, kb: 40, reach:  5,  move:   6},
        [HMCONST.SCALE.COLOSSAL]: {hp: 70, kb: 75, reach:  12, move:  13},
    },
    'skill': {
        'difficulty': {
            'verydifficult': 10,
            'difficult':      0,
            'average':      -40,
            'easy':         -80,
            'trivial':      -90,
        },
    },
    effects: {
        defense: {
            [HMCONST.DEFENSE.DEFENSE1]: 'defense1',
            [HMCONST.DEFENSE.DEFENSE2]: 'defense2',
            [HMCONST.DEFENSE.DEFENSE3]: 'defense3',
            [HMCONST.DEFENSE.DEFENSE4]: 'defense4',
        },
        exclusiveEffects: [
            'defense1',
            'defense2',
            'defense3',
            'defense4',
            'fullparry',
        ],
        statusEffects: {
            defense1: {
                label: 'EFFECT.defense1',
                icon: 'systems/hackmaster5e/styles/icons/swords-emblem1.svg',
                changes: [
                    {key: 'system.bonus.state.def', value:  '1', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                    {key: 'system.bonus.state.atk', value: '-2', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            defense2: {
                label: 'EFFECT.defense2',
                icon: 'systems/hackmaster5e/styles/icons/swords-emblem2.svg',
                changes: [
                    {key: 'system.bonus.state.def', value:  '2', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                    {key: 'system.bonus.state.atk', value: '-4', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            defense3: {
                label: 'EFFECT.defense3',
                icon: 'systems/hackmaster5e/styles/icons/swords-emblem3.svg',
                changes: [
                    {key: 'system.bonus.state.def', value:  '3', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                    {key: 'system.bonus.state.atk', value: '-6', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            defense4: {
                label: 'EFFECT.defense4',
                icon: 'systems/hackmaster5e/styles/icons/swords-emblem4.svg',
                changes: [
                    {key: 'system.bonus.state.def', value:  '4', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                    {key: 'system.bonus.state.atk', value: '-8', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            aggressive: {
                label: 'EFFECT.aggressive',
                icon: 'systems/hackmaster5e/styles/icons/saber-slash.svg',
                changes: [
                    {key: 'system.bonus.state.def', value: '-2', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            charge: {
                label: 'EFFECT.charge',
                icon: 'systems/hackmaster5e/styles/icons/shield-bash.svg',
                changes: [
                    {key: 'system.bonus.state.def', value: HMCONST.C_EFFECT_TYPE.NO_DEXDEF, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM},
                ],
            },
            fullparry: {
                label: 'EFFECT.fullparry',
                icon: 'systems/hackmaster5e/styles/icons/sword-clash.svg',
                changes: [
                    {key: 'system.bonus.state.def', value: '5', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            gground: {
                label: 'EFFECT.gground',
                icon: 'systems/hackmaster5e/styles/icons/swordman.svg',
                changes: [
                    {key: 'system.bonus.state.atk', value: '-1', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            scamper: {
                label: 'EFFECT.scamper',
                icon: 'systems/hackmaster5e/styles/icons/dodging.svg',
                changes: [
                    {key: 'system.bonus.state.atk', value: '-4', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            sfatigue: {
                label: 'EFFECT.sfatigue',
                icon: 'systems/hackmaster5e/styles/icons/stoned-skull.svg',
                changes: [
                    {key: 'system.bonus.state.def',    value: '-6',  mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                    {key: 'system.bonus.state.skills', value: '-30', mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                ],
            },
            incap: {
                label: 'EFFECT.incap',
                icon: 'systems/hackmaster5e/styles/icons/nailed-head.svg',
            },
        },
    },
    c_effect: {
        [HMCONST.C_EFFECT_TYPE.NO_DEXDEF]: (actor) => {
            const defBonus = actor.getAbilityBonus('dex', 'def');
            return Math.min(0, -defBonus);
        },
    },
    'tenacity': {
        0: {'tenacity':  null, 'tenacityCf':  null},
        1: {'tenacity':  2,    'tenacityCf': 0.500},
        2: {'tenacity':  1,    'tenacityCf': 0.400},
        3: {'tenacity':  0,    'tenacityCf': 0.250},
        4: {'tenacity': -4,    'tenacityCf': 0.200},
        5: {'tenacity': -8,    'tenacityCf': 0.001},
    },
    'top': {'character': 0.3, 'beast': 0.4},
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
            ],
            ranged: [
                HMCONST.SPECIAL.RSTANDARD,
            ],
        },
        s4c: { spd: 3 },
        scale: {
            [HMCONST.SCALE.TINY]:     {'minspd': 1},
            [HMCONST.SCALE.SMALL]:    {'minspd': 2},
            [HMCONST.SCALE.MEDIUM]:   {'minspd': 3},
            [HMCONST.SCALE.LARGE]:    {'minspd': 4},
            [HMCONST.SCALE.HUGE]:     {'minspd': 5},
            [HMCONST.SCALE.GIGANTIC]: {'minspd': 6},
            [HMCONST.SCALE.ENORMOUS]: {'minspd': 8},
            [HMCONST.SCALE.COLOSSAL]: {'minspd': 15},
        },
        ranged: {
            reach: {
                [HMCONST.RANGED.REACH.SHORT]:    0,
                [HMCONST.RANGED.REACH.MEDIUM]:   4,
                [HMCONST.RANGED.REACH.LONG]:     6,
                [HMCONST.RANGED.REACH.EXTREME]:  8,
            },
            minspd: (timing) => {
                if (!timing) return 4;
                let minRoF = 0;
                Object.keys(timing).forEach((i) => { if (timing[i]) minRoF++; });
                return minRoF;
            },
            timing: (timing, base) => {
                if (!timing) return {base, declare: base, shoot: 0};

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
                const timingOrder = ['aim', 'load', 'recover', 'draw'];
                const tlength = timingOrder.length;
                for (let i = 0; i < tlength; i++) adjArr[i] = Math.ceil((dt - i) / tlength);

                const timingNew = duplicate(timing);

                // We run through the array twice to ensure all possible bonuses are applied.
                for (let j = 2*tlength - 1; j >= 0; j--) {
                    const jmod = mod(j, tlength);
                    const tCasc = timerCascade(timingNew[timingOrder[jmod]], adjArr[jmod]);
                    timingNew[timingOrder[jmod]] = tCasc[0];
                    adjArr[jmod] = 0;
                    adjArr[mod(j - 1, tlength)] += tCasc[1];
                }

                const declare = (timingNew.load || 0)
                              + (timingNew.draw || 0)
                              + (timingNew.aim  || 0);

                const shoot   = (timingNew.fire    || 0)
                              + (timingNew.recover || 0);
                return {base, declare, shoot};
            },
        },
        'noprof': {
            'table': {
                'minimal': -1,
                'low':     -2,
                'medium':  -4,
                'high':    -6,
            },
            'vector': [1, 1, 1, -1],
        },
    },
    'weight': (bmi, height) => {
        const weight = (bmi * height ** 2) / 703;
        return Math.floor(weight);
    },
    'itemstate': {
        0: 'owned',
        1: 'carried',
        2: 'equipped',
        3: 'innate',
    },
};
