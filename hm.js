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
import { HMWeaponItemSheet } from './modules/item/weapon-item-sheet.js';
import { HMChatMgr } from './modules/mgr/chatmgr.js';
import { HMCombat, HMCombatTracker } from './modules/sys/combat.js';
import { HMDie } from './modules/sys/dice.js';
import { HMMacro } from './modules/sys/macro.js';
import { HMToken } from './modules/sys/token.js';
import { HMSupport } from './modules/sys/support.js';
import { HMStates, HMActiveEffect } from './modules/sys/effects.js';
import { MODULE_ID } from './modules/sys/constants.js';

import registerHandlebarsHelpers from './modules/sys/helpers.js';
import preloadHandlebarsTemplates from './modules/sys/partials.js';

Hooks.once('init', async () => {
    game[MODULE_ID] = { HMActor, HMItem, HMWeaponItem, HMSpellItem };

    CONFIG.ActiveEffect.documentClass = HMActiveEffect;
    CONFIG.Actor.documentClass = HMActorFactory;
    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.Item.documentClass = HMItemFactory;
    CONFIG.Macro.documentClass = HMMacro;

    CONFIG.Dice.terms.d = HMDie;
    const diceTypesIdx = CONFIG.Dice.types.findIndex((x) => x.DENOMINATION === 'd');
    if (diceTypesIdx > -1) CONFIG.Dice.types[diceTypesIdx] = HMDie;

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

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('hackmaster', HMCharacterActorSheet, {types: ['character'], makeDefault: true});
    Actors.registerSheet('hackmaster', HMBeastActorSheet, {types: ['beast'], makeDefault: true});

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('hackmaster', HMItemSheet, {makeDefault: true});
    Items.registerSheet('hackmaster', HMArmorItemSheet, {types: ['armor'], makeDefault: true});
    Items.registerSheet('hackmaster', HMClassItemSheet, {types: ['cclass'], makeDefault: true});
    Items.registerSheet('hackmaster', HMRaceItemSheet, {types: ['race'], makeDefault: true});
    Items.registerSheet('hackmaster', HMWeaponItemSheet, {types: ['weapon'], makeDefault: true});

    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
});

Hooks.once('ready', async () => {
    if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID)) {
        const tItem = game.items.contents.find((a) => a.name === 'test');
        if (tItem) { tItem.sheet.render(true); }
        const tActor = game.actors.contents.find((a) => a.name === 'test');
        if (tActor) { tActor.sheet.render(true); }
    }

    if (!game.user.isGM) return;
    const folderName = game.i18n.localize('HM.sys.folders.skillmacro');
    let f = game.folders.find((a) => a.type === 'Macro' && a.name === folderName);
    if (!f) f = await Folder.create({type: 'Macro', name: folderName, parent: null});
});

Hooks.once('setup', HMStates.setupStatusEffects);
Hooks.once('devModeReady', HMSupport.devModeReady);
Hooks.once('dragRuler.ready', HMSupport.dragRuler_ready);
Hooks.on('applyActiveEffect', HMActiveEffect.applyActiveEffect);
Hooks.on('createActiveEffect', HMActiveEffect.createActiveEffect);
Hooks.on('createActor', HMActor.createActor);
Hooks.on('createToken', HMActor.createToken);
Hooks.on('hoverToken', (token, state) => token.drawReach(state));
Hooks.on('createItem', HMItem.createItem);
Hooks.on('updateItem', HMWeaponItem.updateItem);
Hooks.on('renderChatMessage', HMChatMgr.renderChatMessage);
Hooks.on('updateCombat', HMCombat.updateCombat);
Hooks.on('createCombatant', HMCombat.createCombatant);
Hooks.on('deleteCombatant', HMCombat.deleteCombatant);
Hooks.on('preDeleteCombat', HMCombat.preDeleteCombat);
Hooks.on('deleteCombat', () => canvas.tokens.placeables.forEach((t) => t.drawReach()));
Hooks.on('renderCombatTracker', HMCombatTracker.renderCombatTracker);
Hooks.on('renderSceneControls', HMToken.renderSceneControls);
Hooks.on('getSceneControlButtons', HMToken.getSceneControlButtons);
Hooks.on('hotbarDrop', HMMacro.hotbarDrop);
Hooks.on('diceSoNiceRollStart', HMSupport.diceSoNiceRollStart);
