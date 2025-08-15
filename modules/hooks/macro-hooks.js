import { HMSkillItem } from "../item/skill-item.js";
import { HMCONST, SYSTEM_ID } from "../tables/constants.js";

async function createItemMacro(data, slot) {
    if (!game || !game.macros) return;
    const item = await fromUuid(data.uuid);
    if (item.type !== "skill") return;

    const { bob, img } = item;
    const masteryType = await getSkillMacroType(item);

    const fnOpts = { bob, masteryType };
    const command = `game.${SYSTEM_ID}.HMSkillItem.rollByBob(${JSON.stringify(fnOpts)});`;

    let fullName = item.specname;
    if (masteryType !== HMCONST.SKILL.TYPE.SKILL) {
        fullName = HMCONST.SKILL.TYPE.VERBAL
            ? `${item.specname} [verb]`
            : `${item.specname} [lit]`;
    }

    let macro = game.macros.contents.find(a => a.name === fullName);

    if (!macro) {
        const folderName = game.i18n.localize("HM.sys.folders.skillmacro");
        const f = game.folders.find(a => a.type === "Macro" && a.name === folderName);

        macro = await Macro.create({
            folder: f.id,
            name: fullName,
            ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED },
            type: "script",
            img,
            command,
        }, { renderSheet: false });
    }
    if (macro) game.user?.assignHotbarMacro(macro, slot);
}

export class HMMacroHooks {
    static hotbarDrop(_bar, data, slot) {
        if (data.type === "Item") {
            createItemMacro(data, slot);
            return false;
        }
    }
}

/**
 * Determines which type of skill macro to create.
 * If the skill is a language, returns appropriate macro type unless it's unclear.
 *
 * Asks a user if we should create a verbal or written language macro if the user has both
 * written and verbal language skills.
 *
 * @async
 * @param {HMSkillItem} skill - The skill being made into a macro.
 * @returns {Promise<string|undefined>} - The type of skill to create.
 */
async function getSkillMacroType(skill) {
    const { total } = skill.system.bonus;

    if (!skill.system.language) {
        return HMCONST.SKILL.TYPE.SKILL;
    }

    if (total.literacy > 0 && total.verbal < 1) {
        return HMCONST.SKILL.TYPE.WRITTEN;
    }

    if (total.verbal > 0 && total.literacy < 1) {
        return HMCONST.SKILL.TYPE.VERBAL;
    }

    const title = `${skill.specname}: Macro Type`;
    const content = "<p>A written or verbal language?</p>";

    return foundry.applications.api.DialogV2.wait({
        window: { title },
        content,
        buttons: [
            {
                label: "Written",
                action: HMCONST.SKILL.TYPE.WRITTEN,
            },
            {
                label: "Verbal",
                action: HMCONST.SKILL.TYPE.VERBAL,
            },
        ]
    });
}
