export default class HMRollMgr {
    async getRoll(dataset, dialogResp=null) {
        return await this._stdRoll(dataset, dialogResp);
    }

    async _stdRoll(dataset, dialogResp=null) {
        let formula = Roll.replaceFormulaData(dataset.formula, dialogResp);
        const data = dialogResp.context.data.data;
        return await new Roll(formula, data).evaluate({async: true});
    }
}
