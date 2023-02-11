const FCONST = {
    MELEE: 0,
    RANGED: 1,
};

export const FUMBLETABLE = {
    formula: (atk, def) => {
        const modDelta = parseInt(def, 10) - parseInt(atk, 10);
        const mod = 10 * Math.max(0, modDelta);
        return mod ? `d1000 + ${mod}` : false;
    },

    evaluate: async (formula, type, innate) => {
        if (!formula) return false;

        const roll = await new Roll(formula).evaluate({async: true});
        let rollIdx = FUMBLETABLE.rollIdx[type].findIndex((x) => x >= roll.total);
        const typeIdx = FUMBLETABLE.typeIdx[type].findIndex((x) => x >= roll.total);

        if (innate) {
            if (type === FCONST.MELEE && (rollIdx > 11 && rollIdx < 21)) rollIdx = 99;
            if (type === FCONST.RANGED && (rollIdx > 10 && rollIdx < 16)) rollIdx = 99;
        }
        return {roll, typeIdx, rollIdx};
    },

    rollIdx: {
        [FCONST.MELEE]: [
             200,  216,  232,  247,  263,  276,  318,  343,  364,  370,
             398,  463,  472,  508,  517,  526,  535,  553,  571,  580,
             616,  630,  644,  658,  672,  688,  690,  692,  694,  696,
             698,  700,  702,  704,  706,  708,  710,  712,  714,  716,
             718,  720,  727,  724,  726,  728,  730,  732,  735,  738,
             740,  742,  744,  746,  748,  751,  759,  761,  766,  768,
             770,  771,  773,  774,  864,  941,  964,  982,  995, 1004,
            1010, 1015, 1020, 1024, 1028, 1031, 1034, 1037, 1039, 1041,
            1100, 1200, Infinity,
        ],
        [FCONST.RANGED]: [
             200,  216,  232,  247,  263,  276,  318,  343,  364,  370,
             463,  508,  562,  580,  589,  616,  630,  644,  658,  672,
             686,  694,  698,  704,  708,  712,  716,  722,  728,  733,
             738,  743,  748,  753,  763,  768,  744,  864,  941,  964,
             982, 1044, 1100, 1200, Infinity,
        ],
    },

    typeIdx: {
        [FCONST.MELEE]: [200, 263, 398, 436, 616, 688, 774, 864, 1044, 1100, 1200, Infinity],
        [FCONST.RANGED]: [200, 263, 398, 616, 688, 774, 864, 995, 1044, 1100, 1200, Infinity],
    },
};
