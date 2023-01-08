/* global dragRuler */
/* eslint max-classes-per-file: 0 */
/* eslint class-methods-use-this: 0 */
import { SYSTEM_ID } from '../tables/constants.js';

export class HMSupportHooks {
    static async devModeReady({ registerPackageDebugFlag }) {
        registerPackageDebugFlag(SYSTEM_ID);
    }

    static async diceSoNiceRollStart(_messageId, context) {
        const normalize = (roll, r=1000) => {
            if (r < 0) return;

            for (let i = 0; i < roll.terms.length; i++) {
                // PoolTerms contain sets of terms we need to evaluate.
                if (roll.terms[i]?.rolls) {
                    for (let j = 0; j < roll.terms[i].rolls.length; j++) {
                        normalize(roll.terms[i].rolls[j], r - 1);
                    }
                }

                // Add 1 to penetration dice so DsN shows actual die throws.
                for (let j = 0; j < roll.terms[i]?.results?.length; j++) {
                    const result = roll.terms[i].results[j];
                    if (result.offset) result.result -= result.offset;
                }
            }
        };
        normalize(context.roll);
    }

    static async dragRuler_ready(SpeedProvider) {
        class HMSpeedProvider extends SpeedProvider {
            get colors() {
                return [
                    {id: 0, default: 0x00FF00, name: 'dragRuler.current'},
                    {id: 1, default: 0xFFFF00, name: '±1'},
                    {id: 2, default: 0xFF8000, name: '±2'},
                ];
            }

            getRanges(token) {
                const {combat} = game;
                if (!combat) return [];
                const {round} = combat;
                if (!round) return [];
                const {movespd} = token.actor;
                movespd.push(Infinity);
                movespd[0] = 0;

                const combatant = combat.getCombatantByToken(token.id);
                if (!combatant) return [];
                const movedFlag = combatant.getFlag(SYSTEM_ID, 'moved');
                const moved = movedFlag?.[round - 1] || 0;

                const colormask = [0, 1, 2, 'unreachable', 'unreachable', 2, 1];
                const ridx = Math.min(movespd.findIndex((a) => moved <= a), 4);
                for (let i = 0; i < ridx; i++) colormask.unshift(colormask.pop());
                movespd.pop();

                const ranges = [];
                movespd.forEach((range, i) => ranges.push({range, color: colormask[i]}));

                // dedup extra ranges due to armor.
                return ranges.reduce((acc, curr) => {
                    if (acc[acc.length -1].range === curr.range) acc.pop();
                    acc.push(curr);
                    return acc;
                }, [ranges[0]]);
            }

            async onMovementHistoryUpdate(tokens) {
                // Workaround for broken dragRuler.getMovedDistanceFromToken();
                /* eslint no-shadow: ['error', {'allow': ['combatant']}] */
                function getMovementHistory(token) {
                    const {combat} = game;
                    if (!combat) return [];
                    const combatant = combat.getCombatantByToken(token.id);
                    if (!combatant) return [];
                    const dragRulerFlags = combatant.flags.dragRuler;
                    if (!dragRulerFlags) return [];
                    if (combat.round > dragRulerFlags.trackedRound) return [];
                    return dragRulerFlags.passedWaypoints ?? [];
                }

                tokens.forEach((movedToken) => {
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
                    const movedFlag = combatant.getFlag(SYSTEM_ID, 'moved') || {};
                    const roundCurrent = game.combat.round;
                    movedFlag[roundCurrent] = moved;
                    combatant.setFlag(SYSTEM_ID, 'moved', movedFlag);
                });
            }
        }
        dragRuler.registerSystem(SYSTEM_ID, HMSpeedProvider);
    }
}
