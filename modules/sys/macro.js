import { MACRO_VERS } from "./constants.js";

export class HMMacro extends Macro {
    isObsolete(d_vers, d_mid) {
        const vers = parseInt(DOMPurify.sanitize(d_vers));
        const mid  = DOMPurify.sanitize(d_mid);
        if (MACRO_VERS?.[mid] === vers) return false;

        const msg = "Your macro, <b>" + this.name + "</b> is obsolete. " +
                    "Please obtain a fresh copy from the system compendium!";
        ui.notifications.error(msg);
        return true;
    }
}
