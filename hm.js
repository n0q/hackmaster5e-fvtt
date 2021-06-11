import { HMActor } from "./modules/actor/actor.js";
import { HMCharacterActorSheet } from "./modules/actor/character-actor-sheet.js";
import { HackmasterItem } from "./modules/item/item.js";
import { HackmasterItemSheet } from "./modules/item/item-sheet.js";
import { HMCombat, HMCombatTracker } from "./modules/sys/combat.js";
import { HMMacro } from './modules/sys/macro.js';

import LOGGER from "./modules/sys/logger.js";

import registerHandlebarsHelpers from "./modules/sys/helpers.js";
import preloadHandlebarsTemplates from "./modules/sys/partials.js";

import './modules/sys/dice.js';

Hooks.once("init", async() => {
    LOGGER.log("Initialization start.");

    CONFIG.Actor.documentClass = HMActor;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("hackmaster", HMCharacterActorSheet, { makeDefault: true });

    CONFIG.Item.documentClass = HackmasterItem;
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("hackmaster", HackmasterItemSheet, { makeDefault: true });

    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.ui.combat = HMCombatTracker;
    CONFIG.Macro.documentClass = HMMacro;

    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
    LOGGER.log("Initialization complete.");
});

Hooks.once("ready", async() => {
    // render a sheet to the screen as soon as we enter, for testing purposes.
    if (game.items.contents[0]) {
    //    game.items.contents[0].sheet.render(true);
    }
    if (game.actors.contents[0]) {
        game.actors.contents[0].sheet.render(true);
    }
});

Hooks.on('renderCombatTracker', (chat, html, user) => {
    if (!html.find("[data-control='nextTurn']").length) return;
    html.find("[data-control='nextTurn']")[0].remove();
    html.find("[data-control='previousTurn']")[0].remove();
    html.find(".active").removeClass("active");
});

Hooks.on("diceSoNiceRollStart", (messageId, context) => {
    // Add 1 to penetration dice so dsn shows actual die throws.
    const normalize = (roll, r=5) => {
        if (r < 0) {
            LOGGER.warn("Normalize recursion limit reached.");
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

Hooks.on("createActor", async (actor) => {
    // TODO: Localize skill pack before pushing.
    if (actor.items.size === 0) {
        const skillPack = game.packs.get("hackmaster5e.skills");
        const skillIndex = await skillPack.getIndex();
        let toAdd = [];
        for (let idx of skillIndex) {
            let _ = await skillPack.getDocument(idx._id);
            toAdd.push(_.data);
        }

        await actor.createEmbeddedDocuments("Item", toAdd);
     }
});
