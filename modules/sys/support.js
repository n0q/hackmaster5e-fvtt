/* global dragRuler */
/* eslint max-classes-per-file: 0 */
/* eslint class-methods-use-this: 0 */
import { MODULE_ID } from './constants.js';
import LOGGER from './logger.js';

export class HMSupport {
    static async devModeReady({ registerPackageDebugFlag }) {
        registerPackageDebugFlag(MODULE_ID);
    }

    static async diceSoNiceRollStart(_messageId, context) {
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
    }

    static async dragRuler_ready(SpeedProvider) {
        class HMSpeedProvider extends SpeedProvider {
            get colors() {
                return [
                    {id: 0, default: 0x00FF00, name: 'stable'},
                    {id: 1, default: 0xFFFF00, name: 'rate ± 1'},
                    {id: 2, default: 0xFF8000, name: 'rate ± 2'},
                ];
            }

            getRanges(token) {
                const {combat} = game;
                const {round} = combat.data;
                const {movespd} = token.actor;
                movespd.push(Infinity);

                const combatant = combat.getCombatantByToken(token.id);
                const movedFlag = combatant.getFlag(MODULE_ID, 'moved');
                const moved = movedFlag?.[round - 1] || 0;

                const ratemap = [0, 1, 2, 'unreachable', 'unreachable', 2, 1];
                const ridx = movespd.findIndex((a) => moved <= a);
                for (let i = 0; i < ridx; i++) ratemap.unshift(ratemap.pop());

                const ranges = [];
                movespd.forEach((range, i) => ranges.push({range, color: ratemap[i]}));
                return ranges.splice(0, 4);
            }

            async onMovementHistoryUpdate(tokens) {
                // Workaround for broken dragRuler.getMovedDistanceFromToken();
                /* eslint no-shadow: ['error', {'allow': ['combatant']}] */
                function getMovementHistory(token) {
                    const {combat} = game;
                    if (!combat) return [];
                    const combatant = combat.getCombatantByToken(token.id);
                    if (!combatant) return [];
                    const dragRulerFlags = combatant.data.flags.dragRuler;
                    if (!dragRulerFlags) return [];
                    if (combat.data.round > dragRulerFlags.trackedRound) return [];
                    return dragRulerFlags.passedWaypoints ?? [];
                }

                const movedToken = tokens[0];
                const moveHistory = foundry.utils.duplicate(getMovementHistory(movedToken));
                if (!moveHistory.length) return;

                moveHistory.push(movedToken.center);
                const rays = [];
                for (let i = 0; i < moveHistory.length -1; i++) {
                    rays.push({ray: new Ray(moveHistory[i], moveHistory[i+1])});
                }

                const distances = game.canvas.grid.measureDistances(rays, {gridSpaces: true});
                const moved = Math.round(distances.reduce((sum, a) => sum + a, 0) * 1e4) / 1e4;

                const combatant = game.combat.getCombatantByToken(movedToken.id);
                const movedFlag = combatant.getFlag(MODULE_ID, 'moved') || {};
                const roundCurrent = game.combat.data.round;
                movedFlag[roundCurrent] = moved;
                combatant.setFlag(MODULE_ID, 'moved', movedFlag);
            }
        }
        dragRuler.registerSystem(MODULE_ID, HMSpeedProvider);
    }
}
