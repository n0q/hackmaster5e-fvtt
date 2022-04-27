import { HMTABLES } from '../sys/constants.js';

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
        const formula = Roll.replaceFormulaData(dataset.formula, resp);
        const data = dialogResp ? dialogResp.context.data.data : null;
        return new Roll(formula, data).evaluate({async: true});
    }

    _getFormula(dataset) {
        if (dataset?.formula) return dataset.formula;
        return HMTABLES.formula[dataset.dialog][dataset.formulaType];
    }
}
