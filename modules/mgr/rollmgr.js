import { HMTABLES, HMCONST } from '../sys/constants.js';

function convertToBackstab(stringTerms) {
    const setComparator = (sterms, r=5) => {
        if (r < 0) return;

        const terms = Roll.simplifyTerms(sterms);
        for (let i = 0; i < terms.length; i++) {
            // PoolTerms contain sets of terms we need to evaluate.
            if (terms[i].rolls) {
                for (let j = 0; j < terms[i].rolls.length; j++) {
                    // eslint-disable-next-line
                    const subTerms = setComparator(terms[i].rolls[j].terms, --r);
                    if (subTerms) terms[i].rolls[j] = Roll.fromTerms(Roll.simplifyTerms(subTerms));
                }
                const {modifiers} = terms[i];
                terms[i] = PoolTerm.fromRolls(terms[i].rolls);
                terms[i].modifiers = modifiers;
            }

            if (!terms[i].isDeterministic && terms[i].faces) {
                const {faces, modifiers} = terms[i];
                const mIdx = modifiers.indexOf('p');
                if (!Number.isNaN(mIdx)) terms[i].modifiers[mIdx] = `p>${faces - 2}`;
            }
        }
        return terms; // eslint-disable-line
    };
    return setComparator(stringTerms);
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
        resp.actorbonus = resp?.caller.system.bonus;
        const formula = Roll.replaceFormulaData(dataset.formula, resp);
        const data = dialogResp ? dialogResp.context.system : null;
        const r = new Roll(formula, data);
        if ((resp?.resp?.specialMove === HMCONST.SPECIAL.BACKSTAB
          || resp?.resp?.specialMove === HMCONST.SPECIAL.FLEEING)
          && dataset.dialog          === 'dmg') {
            const terms = convertToBackstab(r.terms);
            return Roll.fromTerms(terms).evaluate({async: true});
        }
        return r.evaluate({async: true});
    }

    _getFormula(dataset) {
        if (dataset?.formula) return dataset.formula;
        return HMTABLES.formula[dataset.dialog][dataset.formulaType];
    }
}
