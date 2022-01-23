import { HMActor } from './modules/actor/actor.js';
import { HMActorFactory } from './modules/actor/actor-factory.js';
import { HMBeastActorSheet } from './modules/actor/beast-actor-sheet.js';
import { HMCharacterActorSheet } from './modules/actor/character-actor-sheet.js';
import { HMItem } from './modules/item/item.js';
import { HMItemSheet } from './modules/item/item-sheet.js';
import { HMCombat, HMCombatTracker } from './modules/sys/combat.js';
import { HMMacro } from './modules/sys/macro.js';
import LOGGER from './modules/sys/logger.js';
import { MODULE_ID } from './modules/sys/constants.js';


import registerHandlebarsHelpers from './modules/sys/helpers.js';
import preloadHandlebarsTemplates from './modules/sys/partials.js';

import './modules/sys/dice.js';

Hooks.once('init', async() => {
    CONFIG.Actor.documentClass = HMActorFactory;
    CONFIG.Item.documentClass = HMItem;
    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.ui.combat = HMCombatTracker;
    CONFIG.Macro.documentClass = HMMacro;

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('hackmaster', HMCharacterActorSheet, {types: ['character'], makeDefault:true});
    Actors.registerSheet('hackmaster', HMBeastActorSheet, {types: ['beast'], makeDefault:true});

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('hackmaster', HMItemSheet, { makeDefault: true });

    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(MODULE_ID);
});

Hooks.once('ready', async() => {
    if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID)) {
        const tItem = game.items.contents.find((a) => a.name === 'test');
        if (tItem) { tItem.sheet.render(true); }
        const tActor = game.actors.contents.find((a) => a.name === 'test');
        if (tActor) { tActor.sheet.render(true); }
    }
});

Hooks.on('createActor', HMActor.createActor);
Hooks.on('renderCombatTracker', HMCombatTracker.renderCombatTracker);
Hooks.on('createItem', HMItem.createItem);
Hooks.on('deleteItem', HMItem.deleteItem);
Hooks.on('createToken', HMActor.createToken);

Hooks.on('diceSoNiceRollStart', (messageId, context) => {
    // Add 1 to penetration dice so dsn shows actual die throws.
    const normalize = (roll, r=5) => {
        if (r < 0) {
            LOGGER.warn('Normalize recursion limit reached.');
            return;
        }

        for (let i = 0; i < roll.terms.length; i++) {
            // PoolTerms contain sets of terms we need to evaluate.
            if (roll.terms[i]?.rolls) {
                for (let j = 0; j < roll.terms[i].rolls.length; j++) {
                    normalize(roll.terms[i].rolls[j], --r);
                }
            }

            let penetrated = false;
            for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
                const result = roll.terms[i].results[j];
                if (penetrated && j) result.result++;
                penetrated = result.penetrated;
            }
        }
    };
    normalize(context.roll);
});
