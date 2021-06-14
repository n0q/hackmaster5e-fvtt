export const SYSTEM_NAME = 'hackmaster5e';

export const MACRO_VERS = {
    "getAttack": 1,
    "getDamage": 1,
    "getDefend": 1,
    "setWound": 1
}

// system rules
export const HMTABLES = {
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
