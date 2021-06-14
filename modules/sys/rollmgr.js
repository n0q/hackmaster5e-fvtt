export default class HMRollMgr {
    async getRoll(dataset, dialogResp=null) {
        const dialog = dataset.dialog;
        if (dialog === "atk") { return await this._weaponRoll(dataset, dialogResp) } else
        if (dialog === "def") { return await this._weaponRoll(dataset, dialogResp) } else
        if (dialog === "dmg") { return await this._weaponRoll(dataset, dialogResp) }
    }

    async _weaponRoll(dataset, dialogResp=null) {
        let formula = Roll.replaceFormulaData(dataset.formula, dialogResp);
        const weaponData = dialogResp.resp.weapon.data.data;
        return await new Roll(formula, weaponData).evaluate({async: true});
    }
}
