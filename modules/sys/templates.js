import { SYSTEM_ID } from '../tables/constants.js';

export const preloadHandlebarsTemplates = () => {
    const templatePath = `systems/${SYSTEM_ID}/templates`;
    loadTemplates([
        `${templatePath}/actor/cards/armor.hbs`,
        `${templatePath}/actor/cards/item.hbs`,
        `${templatePath}/actor/cards/saves.hbs`,
        `${templatePath}/actor/cards/skill.hbs`,
        `${templatePath}/actor/cards/spell.hbs`,
        `${templatePath}/actor/cards/prepped-spell.hbs`,
        `${templatePath}/actor/cards/proficiency.hbs`,
        `${templatePath}/actor/cards/talent.hbs`,
        `${templatePath}/actor/cards/weapon.hbs`,

        `${templatePath}/actor/parts/middle/base-middle.hbs`,
        `${templatePath}/actor/parts/middle/middle-abilities.hbs`,
        `${templatePath}/actor/parts/middle/middle-saves-l.hbs`,
        `${templatePath}/actor/parts/middle/middle-saves-r.hbs`,
        `${templatePath}/actor/parts/middle/middle-stats.hbs`,
        `${templatePath}/actor/parts/middle/middle-wounds.hbs`,
        `${templatePath}/actor/parts/beast-bio.hbs`,
        `${templatePath}/actor/parts/bio.hbs`,
        `${templatePath}/actor/parts/combat/base-combat.hbs`,
        `${templatePath}/actor/parts/combat/combat-armors.hbs`,
        `${templatePath}/actor/parts/combat/combat-weapons.hbs`,
        `${templatePath}/actor/parts/effects/base-effects.hbs`,
        `${templatePath}/actor/parts/header/base-header.hbs`,
        `${templatePath}/actor/parts/header/header-stats.hbs`,
        `${templatePath}/actor/parts/header/header-portrait.hbs`,
        `${templatePath}/actor/parts/inventory/base-inventory.hbs`,
        `${templatePath}/actor/parts/inventory/beast-inventory.hbs`,
        `${templatePath}/actor/parts/overview/base-overview.hbs`,
        `${templatePath}/actor/parts/overview/overview-skills.hbs`,
        `${templatePath}/actor/parts/spells/base-spells.hbs`,
        `${templatePath}/actor/parts/spells/spells-prepped.hbs`,
        `${templatePath}/actor/parts/spells/spells-library.hbs`,
        `${templatePath}/actor/parts/setup/base-setup.hbs`,
        `${templatePath}/actor/parts/setup/beast-base-setup.hbs`,
        `${templatePath}/actor/parts/setup/beast-setup-misc.hbs`,
        `${templatePath}/actor/parts/setup/beast-setup-yield.hbs`,
        `${templatePath}/actor/parts/setup/setup-abilities.hbs`,
        `${templatePath}/actor/parts/setup/setup-classes.hbs`,
        `${templatePath}/actor/parts/setup/setup-misc.hbs`,
        `${templatePath}/actor/parts/setup/setup-profs.hbs`,
        `${templatePath}/actor/parts/setup/setup-priors.hbs`,
        `${templatePath}/actor/parts/setup/setup-talents.hbs`,
        `${templatePath}/actor/parts/skills/base-skills.hbs`,

        `${templatePath}/chat/attack.hbs`,
        `${templatePath}/chat/check.hbs`,
        `${templatePath}/chat/crit.hbs`,
        `${templatePath}/chat/damage.hbs`,
        `${templatePath}/chat/declare.hbs`,
        `${templatePath}/chat/defend.hbs`,
        `${templatePath}/chat/initNote.hbs`,
        `${templatePath}/chat/top.hbs`,
        `${templatePath}/chat/trauma.hbs`,
        `${templatePath}/chat/skill.hbs`,
        `${templatePath}/chat/spell.hbs`,

        `${templatePath}/item/parts/description.hbs`,
        `${templatePath}/item/parts/header-logistics.hbs`,
        `${templatePath}/item/parts/header.hbs`,

        `${templatePath}/dialog/getAbility.hbs`,
        `${templatePath}/dialog/getAttack.hbs`,
        `${templatePath}/dialog/cast.hbs`,
        `${templatePath}/dialog/crit.hbs`,
        `${templatePath}/dialog/getDamage.hbs`,
        `${templatePath}/dialog/defend.hbs`,
        `${templatePath}/dialog/getSave.hbs`,
        `${templatePath}/dialog/getSkill.hbs`,
        `${templatePath}/dialog/getInitDie.hbs`,
        `${templatePath}/dialog/wound.hbs`,
        `${templatePath}/dialog/parts/getRollMode.hbs`,
    ]);
};
