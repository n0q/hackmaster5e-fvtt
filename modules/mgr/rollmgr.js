import { HMTABLES } from '../sys/constants.js';

export default class HMRollMgr {
    async getRoll(dataset, dialogResp=null) {
        if (dataset?.formulaType) dataset.formula = this._getFormula(dataset);
        return await this._stdRoll(dataset, dialogResp);
    }

    async _stdRoll(dataset, dialogResp=null) {
        let formula = Roll.replaceFormulaData(dataset.formula, dialogResp);
        const data = dialogResp.context.data.data;
        return await new Roll(formula, data).evaluate({async: true});
    }

    _getFormula(dataset) {
        if (dataset?.formula) return dataset.formula;
        return HMTABLES[dataset.dialog][dataset.formulaType].formula;
    }
}
