import { HMActor } from './modules/actor/actor.js';
import { HMActorFactory } from './modules/actor/actor-factory.js';
import { HMBeastActorSheet } from './modules/actor/beast-actor-sheet.js';
import { HMCharacterActorSheet } from './modules/actor/character-actor-sheet.js';
import { HMItem } from './modules/item/item.js';
import { HMWeaponItem } from './modules/item/weapon-item.js';
import { HMSpellItem } from './modules/item/spell-item.js';
import { HMItemFactory } from './modules/item/item-factory.js';
import { HMItemSheet } from './modules/item/item-sheet.js';
import { HMWeaponItemSheet } from './modules/item/weapon-item-sheet.js';
import { HMChatMgr } from './modules/mgr/chatmgr.js';
import { HMCombat, HMCombatTracker } from './modules/sys/combat.js';
import { HMMacro } from './modules/sys/macro.js';
import { HMSupport } from './modules/sys/support.js';
import { MODULE_ID } from './modules/sys/constants.js';

import registerHandlebarsHelpers from './modules/sys/helpers.js';
import preloadHandlebarsTemplates from './modules/sys/partials.js';

import './modules/sys/dice.js';

Hooks.once('init', async () => {
    game[MODULE_ID] = { HMActor, HMItem, HMWeaponItem, HMSpellItem };
    CONFIG.Actor.documentClass = HMActorFactory;
    CONFIG.Item.documentClass = HMItemFactory;
    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.ui.combat = HMCombatTracker;
    CONFIG.Macro.documentClass = HMMacro;
    CONFIG.canvasTextStyle._fontFamily = 'Gentium';

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('hackmaster', HMCharacterActorSheet, {types: ['character'], makeDefault: true});
    Actors.registerSheet('hackmaster', HMBeastActorSheet, {types: ['beast'], makeDefault: true});

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('hackmaster', HMItemSheet, {makeDefault: true});
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

Hooks.once('devModeReady', HMSupport.devModeReady);
Hooks.once('dragRuler.ready', HMSupport.dragRuler_ready);
Hooks.on('createActor', HMActor.createActor);
Hooks.on('createToken', HMActor.createToken);
Hooks.on('createItem', HMItem.createItem);
Hooks.on('renderChatMessage', HMChatMgr.renderChatMessage);
Hooks.on('renderCombatTracker', HMCombatTracker.renderCombatTracker);
Hooks.on('hotbarDrop', HMMacro.hotbarDrop);
Hooks.on('diceSoNiceRollStart', HMSupport.diceSoNiceRollStart);
