import { SYSTEM_ID, SYSTEM_SOCKET } from '../tables/constants.js';
import { HMActiveEffectHooks } from './effect-hooks.js';
import { HMActorHooks } from './actor-hooks.js';
import { HMChatHooks } from './chat-hooks.js';
import { HMCombatHooks } from './combat-hooks.js';
import { HMItemHooks } from './item-hooks.js';
import { HMMacroHooks } from './macro-hooks.js';
import { HMSceneControlHooks } from './scene-hooks.js';
import { HMSupportHooks } from './support-hooks.js';
import { HMTokenHooks } from './token-hooks.js';
import { handleSocketEvent } from '../sys/sockets.js';

export const registerHooks = () => {
    Hooks.once('ready', ready);
    Hooks.once('setup', HMActiveEffectHooks.setupStatusEffects);
    Hooks.once('devModeReady', HMSupportHooks.devModeReady);
    Hooks.once('dragRuler.ready', HMSupportHooks.dragRuler_ready);
    Hooks.on('diceSoNiceRollStart', HMSupportHooks.diceSoNiceRollStart);
    Hooks.on('applyActiveEffect', HMActiveEffectHooks.applyActiveEffect);
    Hooks.on('createActiveEffect', HMActiveEffectHooks.createActiveEffect);
    Hooks.on('deleteActiveEffect', HMActiveEffectHooks.deleteActiveEffect);
    Hooks.on('createActor', HMActorHooks.createActor);
    Hooks.on('renderChatMessage', HMChatHooks.renderChatMessage);
    Hooks.on('deleteCombat', HMCombatHooks.deleteCombat);
    Hooks.on('preDeleteCombat', HMCombatHooks.preDeleteCombat);
    Hooks.on('updateCombat', HMCombatHooks.updateCombat);
    Hooks.on('createCombatant', HMCombatHooks.createCombatant);
    Hooks.on('deleteCombatant', HMCombatHooks.deleteCombatant);
    Hooks.on('renderCombatTracker', HMCombatHooks.renderCombatTracker);
    Hooks.on('createItem', HMItemHooks.createItem);
    Hooks.on('preCreateItem', HMItemHooks.preCreateItem);
    Hooks.on('updateItem', HMItemHooks.updateItem);
    Hooks.on('drawGridLayer', drawGridLayer);
    Hooks.on('renderSceneControls', HMSceneControlHooks.renderSceneControls);
    Hooks.on('getSceneControlButtons', HMSceneControlHooks.getSceneControlButtons);
    Hooks.on('createToken', HMTokenHooks.createToken);
    Hooks.on('destroyToken', HMTokenHooks.destroyToken);
    Hooks.on('drawToken', HMTokenHooks.drawToken);
    Hooks.on('controlToken', HMTokenHooks.controlToken);
    Hooks.on('hoverToken', HMTokenHooks.hoverToken);
    Hooks.on('refreshToken', HMTokenHooks.refreshToken);
    Hooks.on('hotbarDrop', HMMacroHooks.hotbarDrop);
    game.socket.on(SYSTEM_SOCKET, handleSocketEvent);
};

function drawGridLayer(layer) {
    layer.reach = layer.addChildAt(new PIXI.Container(), layer.getChildIndex(layer.borders));
}

async function ready() {
    if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(SYSTEM_ID)) {
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
