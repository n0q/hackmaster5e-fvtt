import { MODULE_ID } from './modules/sys/constants.js';
import { HMActor } from './modules/actor/actor.js';
import { HMActorFactory } from './modules/actor/actor-factory.js';
import { HMBeastActorSheet } from './modules/actor/beast-actor-sheet.js';
import { HMCharacterActorSheet } from './modules/actor/character-actor-sheet.js';
import { HMItem } from './modules/item/item.js';
import { HMWeaponItem } from './modules/item/weapon-item.js';
import { HMSpellItem } from './modules/item/spell-item.js';
import { HMItemFactory } from './modules/item/item-factory.js';
import { HMItemSheet } from './modules/item/item-sheet.js';
import { HMArmorItemSheet } from './modules/item/armor-item-sheet.js';
import { HMClassItemSheet } from './modules/item/class-item-sheet.js';
import { HMRaceItemSheet } from './modules/item/race-item-sheet.js';
import { HMSpellItemSheet } from './modules/item/spell-item-sheet.js';
import { HMWeaponItemSheet } from './modules/item/weapon-item-sheet.js';
import { HMCombat, HMCombatTracker } from './modules/sys/combat.js';
import { HMDie } from './modules/sys/dice.js';
import { HMMacro } from './modules/sys/macro.js';
import { HMToken } from './modules/sys/token.js';
import { HMActiveEffect } from './modules/sys/effects.js';
import { registerSystemSettings } from './modules/sys/settings.js';
import { registerHooks } from './modules/sys/hooks.js';
import registerHandlebarsHelpers from './modules/sys/helpers.js';
import preloadHandlebarsTemplates from './modules/sys/partials.js';

function registerSheets() {
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('hackmaster', HMCharacterActorSheet, {types: ['character'], makeDefault: true});
    Actors.registerSheet('hackmaster', HMBeastActorSheet, {types: ['beast'], makeDefault: true});

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('hackmaster', HMItemSheet, {makeDefault: true});
    Items.registerSheet('hackmaster', HMArmorItemSheet, {types: ['armor'], makeDefault: true});
    Items.registerSheet('hackmaster', HMClassItemSheet, {types: ['cclass'], makeDefault: true});
    Items.registerSheet('hackmaster', HMRaceItemSheet, {types: ['race'], makeDefault: true});
    Items.registerSheet('hackmaster', HMSpellItemSheet, {types: ['spell'], makeDefault: true});
    Items.registerSheet('hackmaster', HMWeaponItemSheet, {types: ['weapon'], makeDefault: true});
}

function registerConfig() {
    CONFIG.ActiveEffect.documentClass = HMActiveEffect;
    CONFIG.Actor.documentClass = HMActorFactory;
    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.Item.documentClass = HMItemFactory;
    CONFIG.Macro.documentClass = HMMacro;

    CONFIG.Dice.terms.d = HMDie;
    const diceTypesIdx = CONFIG.Dice.types.findIndex((x) => x.DENOMINATION === 'd');
    diceTypesIdx > -1
        ? CONFIG.Dice.types[diceTypesIdx] = HMDie
        : CONFIG.Dice.types.push(HMDie);

    CONFIG.Token.objectClass = HMToken;
    CONFIG.ui.combat = HMCombatTracker;
    CONFIG.canvasTextStyle.fontFamily = 'Gentium';

    CONFIG.fontDefinitions.Gentium = {
        editor: true,
        fonts: [
            {urls: ['systems/hackmaster5e/styles/fonts/GenBkBasR.woff2']},
            {urls: ['systems/hackmaster5e/styles/fonts/GenBkBasB.woff2'], weight: 700},
            {urls: ['systems/hackmaster5e/styles/fonts/GenBkBasI.woff2'], style: 'italic'},
            {urls: ['systems/hackmaster5e/styles/fonts/GenBkBasBI.woff2'], style: 'italic', weight: 700},
        ],
    };
}

Hooks.once('init', async () => {
    game[MODULE_ID] = { HMActor, HMItem, HMWeaponItem, HMSpellItem };

    registerConfig();
    registerSheets();
    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
    registerSystemSettings();
    registerHooks();
});
