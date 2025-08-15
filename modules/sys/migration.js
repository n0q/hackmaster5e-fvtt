import { SYSTEM_ID } from "../tables/constants.js";

/**
 * Migration result tracking
 *
 * @typedef {Object} MigrationResult
 * @property {number} attempted - Number of documents attempted
 * @property {number} successful - Number of successful migrations
 * @property {string[]} errors - Array of error messages
 */

/**
 * Compendium lock state tracking
 *
 * @typedef {Object} CompendiumLockState
 * @property {CompendiumCollection} pack - The compendium pack
 * @property {boolean} wasLocked - Original lock state
 */

/**
 * Main migration entry point.
 * Checks current version against stored, then migrates as needed.
 *
 * @async
 * @function migrateData
 * @returns {Promise<void>} Resolves when all migrations complete
 */
export const migrateData = async () => {
    const oldVer = game.settings.get(SYSTEM_ID, "gameVer");
    const newVer = game.system.version;

    if (!oldVer) {
        await game.settings.set(SYSTEM_ID, "gameVer", newVer);
        return;
    }

    const migrations = [
        { version: "0.4.25", handler: migrateV0425 },
        { version: "0.5.7", handler: migrateV0507 },
    ];

    for (const migration of migrations) {
        if (foundry.utils.isNewerVersion(migration.version, oldVer)) {
            console.log(`Running migration for v${migration.version}...`);
            await migration.handler();
        }
    }

    if (foundry.utils.isNewerVersion(newVer, oldVer)) {
        await game.settings.set(SYSTEM_ID, "gameVer", newVer);
        ui.notifications.info(`System updated to v${newVer}`);
    }
};

/**
 * Migration for v0.5.7: Remove legacy skill macros.
 *
 * @returns {Promise<void>}
 */
async function migrateV0507() {
    ui.notifications.info("Starting v0.5.7 migration: Removing legacy skill macros...");

    const result = {
        attempted: 0,
        successful: 0,
        errors: []
    };

    try {
        const folderName = game.i18n.localize("HM.sys.folders.skillmacro");
        const folder = game.folders.find(f =>
            f.type === "Macro"
            && f.name === folderName
        );

        if (!folder) {
            console.log("Skill macro folder not found, skipping migration");
            ui.notifications.info("v0.5.7 migration: No skill macro folder found");
            return;
        }

        const macros = game.macros.filter(m => m.folder === folder);
        result.attempted = macros.length;

        if (macros.length === 0) {
            console.log("No macros found in skill macro folder");
            ui.notifications.info("v0.5.7 migration: No macros to remove");
            return;
        }

        console.log(`Found ${macros.length} macros to remove in folder "${folderName}"`);

        for (const macro of macros) {
            try {
                await macro.delete();
                result.successful++;
                console.log(`Removed macro: ${macro.name}`);
            } catch(error) {
                console.error(`Failed to delete macro ${macro.name}:`, error);
                result.errors.push(`${macro.name}: ${error.message}`);
            }
        }

    } catch(error) {
        console.error("Migration v0.5.7 failed:", error);
        result.errors.push(`General error: ${error.message}`);
    }

    reportMigrationResults("v0.5.7", { "Skill Macros": result });
}

/**
 * Migration for v0.4.25: Remove legacy effects with origin property
 *
 * @returns {Promise<void>}
 */
async function migrateV0425() {
    ui.notifications.info("Starting v0.4.25 migration: Removing legacy effects...");

    const results = await migrateActorsWithHandler(async actor => {
        const legacyEffects = actor.effects.filter(fx => fx.origin);

        if (legacyEffects.length > 0) {
            await actor.deleteEmbeddedDocuments("ActiveEffect", legacyEffects.map(e => e.id));
            console.log(`Removed ${legacyEffects.length} legacy effects from ${actor.name}`);
            return legacyEffects.length;
        }

        return 0;
    });

    reportMigrationResults("v0.4.25", { Actors: results });
}

/**
 * Generic actor migration handler
 *
 * @async
 * @param {Function} handler - Async function to process each actor
 * @returns {Promise<MigrationResult>}
 */
async function migrateActorsWithHandler(handler) {
    const { uuids, lockedPacks } = await getActorUUIDsWithUnlock();
    const result = await processMigrationBatch(uuids, handler, "Actor");
    await restoreCompendiumLocks(lockedPacks);
    return result;
}

/**
 * Generic item migration handler
 *
 * @async
 * @param {string} itemType - Type of items to migrate
 * @param {Function} handler - Async function to process each item
 * @returns {Promise<MigrationResult>}
 */
async function migrateItemsWithHandler(itemType, handler) {
    const { uuids, lockedPacks } = await getItemUUIDsWithUnlock(itemType);
    const result = await processMigrationBatch(uuids, handler, `${itemType} Item`);
    await restoreCompendiumLocks(lockedPacks);
    return result;
}

/**
 * Process a batch of documents for migration
 *
 * @async
 * @param {string[]} uuids - Document UUIDs to process
 * @param {Function} handler - Async function to process each document
 * @param {string} documentType - Type of document for logging
 * @returns {Promise<MigrationResult>}
 */
async function processMigrationBatch(uuids, handler, documentType) {
    const result = {
        attempted: uuids.length,
        successful: 0,
        errors: []
    };

    if (uuids.length === 0) return result;

    const progressMessage = `Migrating ${uuids.length} ${documentType}s...`;
    ui.notifications.info(progressMessage);
    console.log(progressMessage);

    await Promise.all(uuids.map(async uuid => {
        try {
            const document = await fromUuid(uuid);
            const changesCount = await handler(document);

            // Only count as successful if changes were made or no changes needed
            if (changesCount >= 0) {
                result.successful++;
            }
        } catch(error) {
            console.error(`Failed to migrate ${documentType} ${uuid}:`, error);
            result.errors.push(`${uuid}: ${error.message}`);
        }
    }));

    return result;
}

/**
 * Get actor UUIDs and unlock necessary compendiums
 *
 * @async
 * @returns {Promise<{uuids: string[], lockedPacks: CompendiumLockState[]}>}
 */
async function getActorUUIDsWithUnlock() {
    const worldActors = game.actors.map(a => a.uuid);
    const actorPacks = game.packs.filter(p => p.metadata.type === "Actor");

    const { compendiumUuids, lockedPacks } = await unlockAndGetCompendiumUuids(actorPacks);

    return {
        uuids: [...worldActors, ...compendiumUuids],
        lockedPacks
    };
}

/**
 * Get item UUIDs and unlock necessary compendiums
 *
 * @async
 * @param {string} itemType - Type of items to get
 * @returns {Promise<{uuids: string[], lockedPacks: CompendiumLockState[]}>}
 */
async function getItemUUIDsWithUnlock(itemType) {
    const worldItems = game.items.filter(i => i.type === itemType).map(i => i.uuid);
    const itemPacks = game.packs.filter(p => p.metadata.type === "Item");

    const { compendiumUuids, lockedPacks } = await unlockAndGetCompendiumUuids(
        itemPacks,
        index => index.filter(i => i.type === itemType)
    );

    return {
        uuids: [...worldItems, ...compendiumUuids],
        lockedPacks
    };
}

/**
 * Unlock compendiums if needed and get document UUIDs
 * @async
 * @param {CompendiumCollection[]} packs - Compendium packs to process
 * @param {Function} [filterFn] - Optional filter function for index entries
 * @returns {Promise<{compendiumUuids: string[], lockedPacks: CompendiumLockState[]}>}
 */
async function unlockAndGetCompendiumUuids(packs, filterFn = null) {
    const lockedPacks = [];
    const compendiumUuids = [];

    for (const pack of packs) {
        // Record original lock state
        if (pack.locked) {
            lockedPacks.push({ pack, wasLocked: true });
            console.log(`Temporarily unlocking compendium: ${pack.metadata.label}`);
            await pack.configure({ locked: false });
        }

        // Get UUIDs
        const index = filterFn ? filterFn(pack.index) : pack.index;
        const uuids = index.map(i => i.uuid);
        compendiumUuids.push(...uuids);
    }

    return { compendiumUuids, lockedPacks };
}

/**
 * Restore original lock state of compendiums
 *
 * @param {CompendiumLockState[]} lockedPacks - Packs to restore
 * @returns {Promise<void>}
 */
async function restoreCompendiumLocks(lockedPacks) {
    for (const { pack, wasLocked } of lockedPacks) {
        if (wasLocked) {
            console.log(`Re-locking compendium: ${pack.metadata.label}`);
            await pack.configure({ locked: true });
        }
    }
}

/**
 * Report migration results to console and UI
 *
 * @param {string} version - Version that was migrated
 * @param {Object<string, MigrationResult>} results - Results by category
 */
function reportMigrationResults(version, results) {
    console.group(`Migration v${version} Results:`);

    let totalAttempted = 0;
    let totalSuccessful = 0;
    const messages = [];

    for (const [category, result] of Object.entries(results)) {
        totalAttempted += result.attempted;
        totalSuccessful += result.successful;

        const message = `${category}: ${result.successful}/${result.attempted} successful`;
        console.log(message);
        messages.push(message);

        if (result.errors.length > 0) {
            console.warn(`${category} errors:`, result.errors);
        }
    }

    console.groupEnd();

    // UI notification
    const summaryMessage = `Migration v${version} complete: ${messages.join(", ")}`;

    if (totalSuccessful === totalAttempted) {
        ui.notifications.info(summaryMessage);
    } else {
        ui.notifications.warn(`${summaryMessage}. Check console for details.`);
    }
}
