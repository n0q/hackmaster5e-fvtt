import { MODULE_ID, SYSTEM_SOCKET } from '../tables/constants.js';
import { HMActiveEffectHooks } from './effect-hooks.js';
import { HMSupport } from '../sys/support.js';
import { HMActorHooks } from './actor-hooks.js';
import { HMChatHooks } from './chat-hooks.js';
import { HMItemHooks } from './item-hooks.js';
import { HMMacroHooks } from './macro-hooks.js';
import { HMTokenHooks } from './token-hooks.js';
import { HMCombat, HMCombatTracker } from '../sys/combat.js';
import { HMToken } from '../sys/token.js';
import { handleSocketEvent } from '../sys/sockets.js';

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
    Hooks.once('setup', HMActiveEffectHooks.setupStatusEffects);
    Hooks.once('devModeReady', HMSupport.devModeReady);
    Hooks.once('dragRuler.ready', HMSupport.dragRuler_ready);
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
    Hooks.on('renderSceneControls', HMToken.renderSceneControls);
    Hooks.on('getSceneControlButtons', HMToken.getSceneControlButtons);
    Hooks.on('hotbarDrop', HMMacroHooks.hotbarDrop);
    game.socket.on(SYSTEM_SOCKET, handleSocketEvent);
};
