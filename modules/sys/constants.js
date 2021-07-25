export const SYSTEM_NAME = "hackmaster5e";

export const MACRO_VERS = {
    "getAttack": 1,
    "getDamage": 1,
    "getDefend": 1,
    "setWound": 1
}

// system rules
export const HMTABLES = {
    "magic": {
        "sp": {
            "a":  30,   "j":  40,  "1":  50,  "2": 60,   "3": 70,   "4":  80,
            "5":  90,   "6": 100,  "7": 110,  "8": 120,  "9": 130, "10": 140,
           "11": 150,  "12": 160, "13": 170, "14": 180, "15": 190, "16": 200,
           "17": 210,  "18": 220, "19": 230, "20": 240,
        }
    },
    "save": {
        "fos":      { formula: "1d20p + @saves.fos.value + @resp.bonus"             },
        "fod":      { formula: "1d20p + @saves.fod.value + @resp.bonus"             },
        "morale":   { formula: "1d20p + @saves.morale.value + @resp.bonus"          },
        "turning":  { formula: "1d20p + @saves.turning.value + @resp.bonus"         },
        "dodge":    { formula: "1d20p + @saves.dodge.value + @resp.bonus"           },
        "mental":   { formula: "1d20p + @saves.mental.value + @resp.bonus"          },
        "physical": { formula: "1d20p + @saves.physical.value + @resp.bonus"        },
        "poison":   { formula: "1d20p + @abilities.con.derived.value + @resp.bonus" },
        "trauma":   { formula: "1d20  - @saves.top.value - @resp.bonus"             },
    },
    "size": {
        "tiny":     {"hp":  0, "kb":  5, "reach": -2,  "movecf":  0.33},
        "small":    {"hp":  5, "kb": 10, "reach": -1,  "movecf":  0.50},
        "medium":   {"hp": 10, "kb": 15, "reach":  0,  "movecf":  1.00},
        "large":    {"hp": 15, "kb": 20, "reach":  1,  "movecf":  2.00},
        "huge":     {"hp": 20, "kb": 25, "reach":  2,  "movecf":  3.00},
        "gigantic": {"hp": 25, "kb": 30, "reach":  3,  "movecf":  4.00},
        "enormous": {"hp": 35, "kb": 40, "reach":  5,  "movecf":  6.00},
        "colossal": {"hp": 70, "kb": 75, "reach":  12, "movecf": 13.00},
    },
    "skill": {
        "difficulty": {
            "HM.verydifficult": 10,
            "HM.difficult":      0,
            "HM.average":      -40,
            "HM.easy":         -80,
            "HM.trivial":      -90
        }
    },
    "weapons": {
        "ranged": {
            "penalty": {
                "short":    0,
                "medium":  -4,
                "long":    -6,
                "extreme": -8,
            }
        },
        "noprof": {
            "table": {
                "minimal": -1,
                "low":     -2,
                "medium":  -4,
                "high":    -6
            },
            "vector": [1, 1, 1, -1]
        }
    }
};
