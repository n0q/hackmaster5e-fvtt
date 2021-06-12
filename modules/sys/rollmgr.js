export default class HMRollMgr {
    constructor(actor=null) {
        this._user = game.user.id;
        if (actor) { this._actor = actor }
    }

    setActor(actor) { this._actor = actor }

    async getRoll(rollType, formula, data, mod=0) {
        if (rollType === "atk") { return await this._rollAttack(formula, data, mod); }
    }

    async _rollAttack(formula, data, mod) {
        formula += mod ? " + " + mod : "";
        const roll = await new Roll(formula, data);
        return await roll.evaluate({async: true});
    }



}
