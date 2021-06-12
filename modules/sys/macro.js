import { MACRO_VERS } from "./constants.js";
import HMDialogMgr from './dialogmgr.js';
import HMChatMgr from './chatmgr.js';
import HMRollMgr from "./rollmgr.js";

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

    get dialogmgr() { return new HMDialogMgr }
    get chatmgr()   { return new HMChatMgr }
    get rollmgr()   { return new HMRollMgr }

    _hm_getActor({allActors=false}={}) {
        const tokens = canvas.tokens.controlled.filter((a) => a.actor);

        let actors = [];
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i]?.actor) actors.push(tokens[i]?.actor);
        }
        if (!actors.length) return null;
        if (allActors) return actors;

        const actor=actors[0];
        if (actors.length > 1) {
            ui.notifications.warn(game.i18n.localize("HM.dialog.warnMulti") + actor.name + "</b>.");
        }
        return actor;
    }
}
