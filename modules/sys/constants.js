export const SYSTEM_NAME = 'hackmaster5e';

export const MACRO_VERS = {
    "getAttack": 1,
    "setWound": 1
}

// system rules
export const HMTABLES = {
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
