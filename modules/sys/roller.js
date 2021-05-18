export default class RollHandler {
    constructor(terms) {
        this._roll     = null;
        this._terms    = terms;
    }

    async roll() {
        this._roll = await new Roll(this._terms).evaluate({async: true});
    }

}
