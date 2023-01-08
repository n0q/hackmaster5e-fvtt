import { SYSTEM_ID, SYSTEM_SOCKET } from '../tables/constants.js';
import { HMActiveEffectHooks } from './effect-hooks.js';
import { HMActorHooks } from './actor-hooks.js';
import { HMChatHooks } from './chat-hooks.js';
import { HMCombat, HMCombatTracker } from '../sys/combat.js';
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
    Hooks.on('applyActiveEffect', HMActiveEffectHooks.applyActiveEffect);
    Hooks.on('createActiveEffect', HMActiveEffectHooks.createActiveEffect);
    Hooks.on('deleteActiveEffect', HMActiveEffectHooks.deleteActiveEffect);
    Hooks.on('createActor', HMActorHooks.createActor);
    Hooks.on('createToken', HMTokenHooks.createToken);
    Hooks.on('hoverToken', (token, state) => token.drawReach(state));
    Hooks.on('createItem', HMItemHooks.createItem);
    Hooks.on('preCreateItem', HMItemHooks.preCreateItem);
    Hooks.on('updateItem', HMItemHooks.updateItem);
    Hooks.on('renderChatMessage', HMChatHooks.renderChatMessage);
    Hooks.on('updateCombat', HMCombat.updateCombat);
    Hooks.on('createCombatant', HMCombat.createCombatant);
    Hooks.on('deleteCombatant', HMCombat.deleteCombatant);
    Hooks.on('preDeleteCombat', HMCombat.preDeleteCombat);
    Hooks.on('deleteCombat', () => canvas.tokens.placeables.forEach((t) => t.drawReach()));
    Hooks.on('renderCombatTracker', HMCombatTracker.renderCombatTracker);
    Hooks.on('renderSceneControls', HMSceneControlHooks.renderSceneControls);
    Hooks.on('getSceneControlButtons', HMSceneControlHooks.getSceneControlButtons);
    Hooks.on('hotbarDrop', HMMacroHooks.hotbarDrop);
    game.socket.on(SYSTEM_SOCKET, handleSocketEvent);
};

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
