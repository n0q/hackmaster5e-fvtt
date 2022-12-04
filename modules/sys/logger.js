/* eslint no-console:0 */
/* global game */
import { MODULE_ID } from '../tables/constants.js';

export default class LOGGER {
    static _dmode() {
        return game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);
    }

    static log(msg) {
        if (this._dmode()) { console.log(`${MODULE_ID} | ${msg}`); }
    }

    static debug(msg) {
        if (this._dmode()) { console.debug(`${MODULE_ID} | ${msg}`); }
    }

    static debugObject(obj) {
        if (this._dmode()) { console.debug(`${MODULE_ID} | ${obj}`); }
    }

    static warn(msg) {
        if (this._dmode()) { console.warn(`${MODULE_ID} | ${msg}`); }
    }

    static trace(msg) {
        if (this._dmode()) { console.log(`${MODULE_ID} | Trace: ${msg}`); }
    }

    static error(msg) {
        if (this._dmode()) { console.error(`${MODULE_ID} | ${msg}`); }
    }
}
