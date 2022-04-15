import { MODULE_ID } from './constants.js';
import { MACRO_VERS } from './constants.js';
import { HMItem } from '../item/item.js';
import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMRollMgr } from '../mgr/rollmgr.js';

/* global DOMPurify */
async function createSkillMacro(itemData, slot) {
    if (!game || !game.macros) return;

    const {name, img} = itemData;
    const {specialty} = itemData.data;
    const args = {skillName: DOMPurify.sanitize(name)};
    if (specialty.checked) args.specialty = DOMPurify.sanitize(specialty.value);
    const fullName = HMItem.specname(itemData);

    const command = `game.${MODULE_ID}.HMItem.rollSkill(${JSON.stringify(args)});`;
    let macro = game.macros.contents.find((a) => a.name === fullName);
    if (!macro) {

        const folderName = game.i18n.localize('HM.sys.folders.skillmacro');
        const f = game.folders.find((a) => a.type === 'Macro' && a.name === folderName);

        macro = await Macro.create({
            folder: f.id,
            name: fullName,
            permission: {default: CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED},
            type: 'script',
            img,
            command,
        }, { renderSheet: false });
    }

    if (macro) game.user?.assignHotbarMacro(macro, slot);
}

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
            ui.notifications.warn(`${game.i18n.localize('HM.dialog.warnMulti')} ${actor.name}</b>.`);
        }
        return actor;
    }

    static async hotbarDrop(_bar, data, slot) {
        if (data.type === 'Macro') return;
        if (data.data.type === 'skill') { createSkillMacro(data.data, slot); }
    }
}
