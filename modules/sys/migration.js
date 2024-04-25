import { SYSTEM_ID } from '../tables/constants.js';

/**
 * Sets the current game version in the system settings.
 * Intended for future use to handle data schema migrations between different game versions.
 * The function currently sets the game version to the system's version, preparing for future checks
 * and potential migrations.
 */
export const migrateData = async function migrate() {
    const oldVer = game.settings.get(SYSTEM_ID, 'gameVer');
    const newVer = game.system.version;
    if (oldVer !== newVer) game.settings.set(SYSTEM_ID, 'gameVer', newVer);
};
