export default class RollHandler {
    constructor(terms, ddata=null) {
        this._roll     = null;
        this._terms    = terms;
        this._ddata    = ddata;
    }

    async roll() {
        this._roll = await new Roll(this._terms, this._ddata).evaluate({async: true});
    }

}
