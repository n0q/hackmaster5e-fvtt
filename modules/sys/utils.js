import { HMCONST } from '../tables/constants.js';

export const transformDamageFormula = (stringTerms, operation=new Set()) => {
    const {FORMULA_MOD} = HMCONST;
    const setComparator = (sterms, oper, r=5) => {
        if (r < 0) return;

        const terms = Roll.simplifyTerms(sterms);
        for (let i = 0; i < terms.length; i++) {
            // PoolTerms contain sets of terms we need to evaluate.
            if (terms[i].rolls) {
                for (let j = 0; j < terms[i].rolls.length; j++) {
                    const subTerms = setComparator(terms[i].rolls[j].terms, oper, r - 1);
                    if (subTerms) terms[i].rolls[j] = Roll.fromTerms(Roll.simplifyTerms(subTerms));
                }

                const {modifiers} = terms[i];
                terms[i] = PoolTerm.fromRolls(terms[i].rolls);
                terms[i].modifiers = modifiers;
            }

            if (!terms[i].isDeterministic && terms[i].faces) {
                const {faces, modifiers, number} = terms[i];

                if (oper.has(FORMULA_MOD.DOUBLE)) terms[i].number *= 2;

                if (oper.has(FORMULA_MOD.HALVE)) {
                    number > 1
                        ? terms[i].number = Math.floor(number / 2)
                        : terms[i].faces  = Math.max(Math.floor(faces / 2), 1);
                }

                if (oper.has(FORMULA_MOD.NOPENETRATE)) {
                    const mIdx = modifiers.indexOf('p');
                    if (!Number.isNaN(mIdx)) terms[i].modifiers.splice(mIdx, 1);
                }

                if (oper.has(FORMULA_MOD.BACKSTAB)) {
                    const mIdx = modifiers.indexOf('p');
                    if (!Number.isNaN(mIdx)) terms[i].modifiers[mIdx] = `p>${faces - 2}`;
                }
            }
        }
        return terms; // eslint-disable-line
    };
    return setComparator(stringTerms, operation);
};