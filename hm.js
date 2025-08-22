import { SYSTEM_ID, systemPath } from "./modules/tables/constants.js";
import { HMActor } from "./modules/actor/actor.js";
import { HMActorFactory } from "./modules/actor/actor-factory.js";
import { HMBeastActorSheet } from "./modules/actor/beast-actor-sheet.js";
import { HMCharacterActorSheet } from "./modules/actor/character-actor-sheet.js";
import { HMItem } from "./modules/item/item.js";
import { HMWeaponItem } from "./modules/item/weapon-item.js";
import { HMSkillItem } from "./modules/item/skill-item.js";
import { HMSpellItem } from "./modules/item/spell-item.js";
import { HMItemFactory } from "./modules/item/item-factory.js";
import { HMItemSheet } from "./modules/item/sheets/item-sheet.js";
import { HMArmorItemSheet } from "./modules/item/sheets/armor-item-sheet.js";
import { HMClassItemSheet } from "./modules/item/sheets/class-item-sheet.js";
import { HMCurrencyItemSheet } from "./modules/item/sheets/currency-item-sheet.js";
import { HMProficiencyItemSheet } from "./modules/item/sheets/proficiency-item-sheet.js";
import { HMRaceItemSheet } from "./modules/item/sheets/race-item-sheet.js";
import { HMSpellItemSheet } from "./modules/item/sheets/spell-item-sheet.js";
import { HMTalentItemSheet } from "./modules/item/sheets/talent-item-sheet.js";
import { HMWeaponItemSheet } from "./modules/item/sheets/weapon-item-sheet.js";
import { HMWoundItemSheet } from "./modules/item/sheets/wound-item-sheet.js";
import { HMCombat } from "./modules/combat/combat.js";
import { HMCombatTracker } from "./modules/combat/combat-tracker.js";
import { HMDie } from "./modules/sys/dice.js";
import { HMToken } from "./modules/sys/token.js";
import { HMTokenRuler } from "./modules/sys/token-ruler.js";
import { HMActiveEffect } from "./modules/sys/effects.js";
import { registerSystemSettings } from "./modules/sys/settings.js";
import { registerHooks } from "./modules/hooks/hooks.js";
import { registerHandlebarsHelpers } from "./modules/sys/helpers.js";
import { preloadHandlebarsTemplates } from "./modules/sys/templates.js";
import gsap, { PixiPlugin } from '/scripts/greensock/esm/all.js'; // eslint-disable-line
import { registerSchema } from "./modules/sys/schema.js";
import { migrateData } from "./modules/sys/migration.js";
import { HMBeastActor } from "./modules/actor/beast-actor.js";

function registerSheets() {
    const ActorsCollection = foundry.documents.collections.Actors;
    const ItemsCollection = foundry.documents.collections.Items;

    ActorsCollection.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    ItemsCollection.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

    const actorSheets = [
        { sheetClass: HMCharacterActorSheet, types: ["character"] },
        { sheetClass: HMBeastActorSheet, types: ["beast"] },
    ];

    const itemSheets = [
        { sheetClass: HMItemSheet },
        { sheetClass: HMArmorItemSheet, types: ["armor"] },
        { sheetClass: HMClassItemSheet, types: ["cclass"] },
        { sheetClass: HMCurrencyItemSheet, types: ["currency"] },
        { sheetClass: HMProficiencyItemSheet, types: ["proficiency"] },
        { sheetClass: HMRaceItemSheet, types: ["race"] },
        { sheetClass: HMSpellItemSheet, types: ["spell"] },
        { sheetClass: HMTalentItemSheet, types: ["talent"] },
        { sheetClass: HMWeaponItemSheet, types: ["weapon"] },
        { sheetClass: HMWoundItemSheet, types: ["wound"] },
    ];

    actorSheets.forEach(({ sheetClass, types }) => {
        ActorsCollection.registerSheet("hackmaster", sheetClass, { types, makeDefault: true });
    });

    itemSheets.forEach(({ sheetClass, types }) => {
        const options = { makeDefault: true };
        if (types) {
            options.types = types;
        }
        ItemsCollection.registerSheet("hackmaster", sheetClass, options);
    });
}

function registerConfig() {
    CONFIG.ActiveEffect.documentClass = HMActiveEffect;
    CONFIG.Actor.documentClass = HMActorFactory;
    CONFIG.Combat.documentClass = HMCombat;
    CONFIG.Item.documentClass = HMItemFactory;

    Roll.CHAT_TEMPLATE = systemPath("templates/dice/roll.hbs");
    CONFIG.Dice.terms.d = HMDie;
    CONFIG.Dice.types = CONFIG.Dice.types.map(cls => cls.DENOMINATION === "d" ? HMDie : cls);

    CONFIG.Token.objectClass = HMToken;
    CONFIG.Token.rulerClass = HMTokenRuler;
    const { walk, displace } = CONFIG.Token.movement.actions;
    CONFIG.Token.movement.actions = { displace, walk };
    CONFIG.ui.combat = HMCombatTracker;
    CONFIG.canvasTextStyle.fontFamily = "Gentium";

    CONFIG.fontDefinitions.Gentium = {
        editor: true,
        fonts: [
            { urls: ["systems/hackmaster5e/styles/fonts/GenBkBasR.woff2"] },
            { urls: ["systems/hackmaster5e/styles/fonts/GenBkBasB.woff2"], weight: 700 },
            { urls: ["systems/hackmaster5e/styles/fonts/GenBkBasI.woff2"], style: "italic" },
            { urls: ["systems/hackmaster5e/styles/fonts/GenBkBasBI.woff2"], style: "italic", weight: 700 },
        ],
    };

    CONFIG.time.roundTime = 1;
    delete CONFIG.specialStatusEffects.BLIND;
}

function registerGsapPlugins() {
    PixiPlugin.registerPIXI(PIXI);
    gsap.registerPlugin(PixiPlugin);
    game.gsap = gsap;
}

Hooks.once("init", async () => {
    game[SYSTEM_ID] = { HMActor, HMItem, HMWeaponItem, HMSkillItem, HMSpellItem };
    registerConfig();
    registerSchema();
    registerSheets();
    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
    registerSystemSettings();
    registerGsapPlugins();
    registerHooks();
});

Hooks.once("ready", () => {
    migrateData();
    HMBeastActor.preloadValidSyntheticBobs(); /** @async Technically */
});
