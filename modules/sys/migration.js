import { SYSTEM_ID } from '../tables/constants.js';

/*
 * Handled data migration between different game versions.
 * Checks current version against stored, then migrates as needed.
 *
 * @async
 * @function migrateData
 * @returns {Promise<void>} Resolves when task is completed.
 */
export const migrateData = async function migrate() {
    const oldVer = game.settings.get(SYSTEM_ID, 'gameVer');
    const newVer = game.system.version;
    if (!oldVer) {
        await game.settings.set(SYSTEM_ID, 'gameVer', newVer);
        return;
    }

    if (foundry.utils.isNewerVersion('0.4.25', oldVer)) await migrateV0425();

    if (foundry.utils.isNewerVersion(newVer, oldVer)) {
        await game.settings.set(SYSTEM_ID, 'gameVer', newVer);
    }
};

/*
 * Migration function for 0.4.25.
 * Removes legacy effects with an origin property.
 *
 * @async
 * @function migrateV0425
 * @returns {Promise<void>} Resolves when task is completed.
 */
async function migrateV0425() {
    const actors = await getActorsByUuid();

    const startString = `Migrating ${actors.length} actors. Hang on a second.`;
    ui.notifications.info(startString);

    await Promise.all(actors.map(async (uuid) => {
        const actor = await fromUuid(uuid);
        const legacyEffects = actor.effects.filter((fx) => fx.origin);
        if (legacyEffects.length) {
            console.warn(`Updated ${actor.name}.`);
            actor.deleteEmbeddedDocuments('ActiveEffect', legacyEffects.map((e) => e.id));
        }
    }));

    ui.notifications.info('All done!');
}

/**
 * Retrieves actor uuids from world and unlocked compendiums.
 *
 * @async
 * @function getActorsByUuid
 * @returns {Promise<string[]>} - List of actor uuids.
 */
async function getActorsByUuid() {
    const worldActors = game.actors.map((a) => a.uuid);

    const actorPacks = game.packs.filter((p) => p.metadata.type === 'Actor' && !p.locked);
    const compendiumActors = actorPacks.map((p) => p.index.map((i) => i.uuid)).flat();
    return [...worldActors, ...compendiumActors];
}
