import { MODULE_ID } from '../tables/constants.js';

async function createItemMacro(data, slot) {
    if (!game || !game.macros) return;
    const item = await fromUuid(data.uuid);

    if (item.type !== 'skill') return;

    const {system, img} = item;
    const {specialty} = system;
    const args = {skillName: item.name};
    if (specialty.checked) args.specialty = specialty.value;
    const command = `game.${MODULE_ID}.HMItem.rollSkill(${JSON.stringify(args)});`;

    const fullName = item.specname;

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
    static hotbarDrop(_bar, data, slot) {
        if (data.type === 'Item') {
            createItemMacro(data, slot);
            return false;
        }
        return true;
    }
}
