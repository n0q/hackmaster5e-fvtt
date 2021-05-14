import { HackmasterActor } from "./actor/actor.js";
import { HackmasterActorSheet } from "./actor/actor-sheet.js";
import { HackmasterItem } from "./item/item.js";
import { HackmasterItemSheet } from "./item/item-sheet.js";

import LOGGER from "./utils/logger.js";

import registerHandlebarsHelpers from "./sys/helpers.js";

import './dice.js';

Hooks.once("init", async() => {
    LOGGER.log("Initialization start.");

    game.hackmaster = {
        HackmasterActor
    };

    CONFIG.Actor.documentClass = HackmasterActor;
    CONFIG.Item.documentClass = HackmasterItem;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("hackmaster", HackmasterActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("hackmaster", HackmasterItemSheet, { makeDefault: true });

    registerHandlebarsHelpers();
    LOGGER.log("Initialization complete.");
});

Hooks.once("ready", async() => {
    LOGGER.log("Ready start.");
    // render a sheet to the screen as soon as we enter, for testing purposes.
    game.items.contents[0].sheet.render(true);
    game.actors.contents[0].sheet.render(true);

    LOGGER.log("Ready complete.");
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
