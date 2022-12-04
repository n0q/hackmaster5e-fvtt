import { MODULE_ID } from '../tables/constants.js';
import { HMStates, HMActiveEffect } from './effects.js';
import { HMSupport } from './support.js';
import { HMActor } from '../actor/actor.js';
import { HMItem } from '../item/item.js';
import { HMWeaponItem } from '../item/weapon-item.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMCombat, HMCombatTracker } from './combat.js';
import { HMToken } from './token.js';
import { HMMacro } from './macro.js';

async function ready() {
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
}

export const registerHooks = () => {
    Hooks.once('ready', ready);
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
//  Hooks.on('diceSoNiceRollStart', HMSupport.diceSoNiceRollStart);
};
