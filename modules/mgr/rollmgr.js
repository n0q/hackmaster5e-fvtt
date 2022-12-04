import { HMTABLES, HMCONST } from '../tables/constants.js';

function convertDamageFormula(stringTerms, operation=new Set()) {
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
}

export class HMRollMgr {
    async getRoll(dataset, dialogResp=null) {
        if (dialogResp?.resp?.formulaType) {
            dataset.formulaType = dialogResp.resp.formulaType;
        }

        if (dataset?.formulaType) dataset.formula = this._getFormula(dataset);
        return this._stdRoll(dataset, dialogResp);
    }

    // TODO: Refactor.
    async _stdRoll(dataset, dialogResp=null) {
        const resp = dialogResp ? dialogResp : dataset.resp;
        resp.actorbonus = resp?.caller?.system?.bonus ?? 0;
        const formula = Roll.replaceFormulaData(dataset.formula, resp);
        const data = dialogResp ? dialogResp?.context?.system : null;
        const r = new Roll(formula, data);

        const specialMove = resp?.resp?.specialMove;
        const defense = resp?.resp?.defense;

        if (dataset.dialog === 'dmg') {
            const {SPECIAL, FORMULA_MOD} = HMCONST;
            const opSet = new Set();
            const {autoFormula} = resp.resp;

            if (specialMove === SPECIAL.JAB && autoFormula) opSet.add(FORMULA_MOD.HALVE);    else
            if (specialMove === SPECIAL.BACKSTAB)           opSet.add(FORMULA_MOD.BACKSTAB); else
            if (specialMove === SPECIAL.FLEEING)            opSet.add(FORMULA_MOD.BACKSTAB); else
            if (specialMove === SPECIAL.SET4CHARGE)         opSet.add(FORMULA_MOD.DOUBLE);

            if (defense)                                    opSet.add(FORMULA_MOD.NOPENETRATE);

            const terms = convertDamageFormula(r.terms, opSet);
            return Roll.fromTerms(terms).evaluate({async: true});
        }

        return r.evaluate({async: true});
    }

    _getFormula(dataset) {
        if (dataset?.formula) return dataset.formula;
        return HMTABLES.formula[dataset.dialog][dataset.formulaType];
    }
}
