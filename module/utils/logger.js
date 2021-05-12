/* eslint no-console:0 */
/* global game */
export default class LOGGER {
    static log(msg) {
        console.log(`Hackmaster  | ${msg}`);
    }

    static debug(msg) {
        console.debug(`Hackmaster  | ${msg}`);
    }

    static debugObject(obj) {
        console.debug(obj);
    }

    static warn(msg) {
        console.warn(`Hackmaster  | ${msg}`);
    }

    static trace(msg) {
        console.log(`Hackmaster  | Trace: ${msg}`);
    }

    static error(msg) {
        console.error(`Hackmaster  | ${msg}`);
    }
}
