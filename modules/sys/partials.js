export default function preloadHandlebarsTemplates() {
    return loadTemplates([
        'systems/hackmaster5e/templates/actor/cards/armor.hbs',
        'systems/hackmaster5e/templates/actor/cards/item.hbs',
        'systems/hackmaster5e/templates/actor/cards/saves.hbs',
        'systems/hackmaster5e/templates/actor/cards/skill.hbs',
        'systems/hackmaster5e/templates/actor/cards/spell.hbs',
        'systems/hackmaster5e/templates/actor/cards/prepped-spell.hbs',
        'systems/hackmaster5e/templates/actor/cards/proficiency.hbs',
        'systems/hackmaster5e/templates/actor/cards/weapon.hbs',

        'systems/hackmaster5e/templates/actor/parts/middle/base-middle.hbs',
        'systems/hackmaster5e/templates/actor/parts/middle/middle-abilities.hbs',
        'systems/hackmaster5e/templates/actor/parts/middle/middle-saves-l.hbs',
        'systems/hackmaster5e/templates/actor/parts/middle/middle-saves-r.hbs',
        'systems/hackmaster5e/templates/actor/parts/middle/middle-stats.hbs',
        'systems/hackmaster5e/templates/actor/parts/middle/middle-wounds.hbs',
        'systems/hackmaster5e/templates/actor/parts/beast-bio.hbs',
        'systems/hackmaster5e/templates/actor/parts/bio.hbs',
        'systems/hackmaster5e/templates/actor/parts/combat/base-combat.hbs',
        'systems/hackmaster5e/templates/actor/parts/combat/combat-armors.hbs',
        'systems/hackmaster5e/templates/actor/parts/combat/combat-weapons.hbs',
        'systems/hackmaster5e/templates/actor/parts/header/base-header.hbs',
        'systems/hackmaster5e/templates/actor/parts/header/header-stats.hbs',
        'systems/hackmaster5e/templates/actor/parts/header/header-portrait.hbs',
        'systems/hackmaster5e/templates/actor/parts/inventory/base-inventory.hbs',
        'systems/hackmaster5e/templates/actor/parts/inventory/beast-inventory.hbs',
        'systems/hackmaster5e/templates/actor/parts/overview/base-overview.hbs',
        'systems/hackmaster5e/templates/actor/parts/overview/overview-skills.hbs',
        'systems/hackmaster5e/templates/actor/parts/spells/base-spells.hbs',
        'systems/hackmaster5e/templates/actor/parts/spells/spells-prepped.hbs',
        'systems/hackmaster5e/templates/actor/parts/spells/spells-library.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/base-setup.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/beast-base-setup.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/setup-abilities.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/setup-classes.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/setup-misc.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/setup-move.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/setup-profs.hbs',
        'systems/hackmaster5e/templates/actor/parts/setup/setup-priors.hbs',
        'systems/hackmaster5e/templates/actor/parts/skills/base-skills.hbs',

        'systems/hackmaster5e/templates/chat/attack.hbs',
        'systems/hackmaster5e/templates/chat/check.hbs',
        'systems/hackmaster5e/templates/chat/declare.hbs',
        'systems/hackmaster5e/templates/chat/defend.hbs',
        'systems/hackmaster5e/templates/chat/initNote.hbs',
        'systems/hackmaster5e/templates/chat/top.hbs',
        'systems/hackmaster5e/templates/chat/trauma.hbs',
        'systems/hackmaster5e/templates/chat/skill.hbs',
        'systems/hackmaster5e/templates/chat/spell.hbs',

        'systems/hackmaster5e/templates/item/parts/description.hbs',
        'systems/hackmaster5e/templates/item/parts/header-logistics.hbs',
        'systems/hackmaster5e/templates/item/parts/header.hbs',

        'systems/hackmaster5e/templates/dialog/getAbility.hbs',
        'systems/hackmaster5e/templates/dialog/getAttack.hbs',
        'systems/hackmaster5e/templates/dialog/cast.hbs',
        'systems/hackmaster5e/templates/dialog/getDamage.hbs',
        'systems/hackmaster5e/templates/dialog/defend.hbs',
        'systems/hackmaster5e/templates/dialog/getSave.hbs',
        'systems/hackmaster5e/templates/dialog/getSkill.hbs',
        'systems/hackmaster5e/templates/dialog/getInitDie.hbs',
        'systems/hackmaster5e/templates/dialog/setWound.hbs',
        'systems/hackmaster5e/templates/dialog/parts/getRollMode.hbs',
    ]);
}
