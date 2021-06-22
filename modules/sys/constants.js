export const SYSTEM_NAME = 'hackmaster5e';

export const MACRO_VERS = {
    "getAttack": 1,
    "getDamage": 1,
    "getDefend": 1,
    "setWound": 1
}

// system rules
export const HMTABLES = {
    "save": {
        "fos":      { "formula": "1d20p + @saves.fos.value + @resp.bonus" },
        "fod":      { "formula": "1d20p + @saves.fod.value + @resp.bonus" },
        "morale":   { "formula": "1d20p + @saves.morale.value + @resp.bonus" },
        "turning":  { "formula": "1d20p + @level.value + @saves.turning.value + @resp.bonus" },
        "dodge":    { "formula": "1d20p + @level.value + @saves.dodge.value + @resp.bonus" },
        "mental":   { "formula": "1d20p + @level.value + @saves.mental.value + @resp.bonus" },
        "physical": { "formula": "1d20p + @level.value + @saves.physical.value + @resp.bonus" },
        "poison":   { "formula": "1d20p + @abilities.con.derived.value + @resp.bonus" },
        "top":      { "formula": "1d20  - @saves.top.value - @resp.bonus" }
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
