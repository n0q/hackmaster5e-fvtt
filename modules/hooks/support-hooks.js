/* global dragRuler */
/* eslint max-classes-per-file: 0 */
/* eslint class-methods-use-this: 0 */
import { SYSTEM_ID } from '../tables/constants.js';
import { HMDie } from '../sys/dice.js';
import { tokenHPAttribute, HM_ER_SPEED } from '../integrations/elevationruler.js';

export class HMSupportHooks {
    static registerSupportModules() {
        if (CONFIG.elevationruler) {
            const {SPEED} = CONFIG.elevationruler;
            CONFIG.elevationruler.tokenHPAttribute = tokenHPAttribute;
            CONFIG.elevationruler.SPEED = foundry.utils.mergeObject(SPEED, HM_ER_SPEED);
        }
    }

    static async devModeReady({ registerPackageDebugFlag }) {
        registerPackageDebugFlag(SYSTEM_ID);
    }

    static async diceSoNiceRollStart(_, context) {
        // eslint-disable-next-line no-shadow
        const dsnDecay = (terms, dsnTerms, newTerms=[], r=5) => {
            if (r < 0) return false;

            terms.forEach((term, i) => {
                const dsnTerm = dsnTerms[i];
                if (term.rolls) {
                    term.rolls.forEach((rolls, j) => {
                        dsnDecay(term.rolls[j].terms, dsnTerm.rolls[j].terms, newTerms, r - 1);
                    });
                }

                dsnTerm.results = foundry.utils.deepClone(term.results);

                if (!dsnTerm.isDeterministic && dsnTerm.faces >= 20) {
                    const biasIdx = dsnTerm.results.findIndex((x) => x.bias);
                    if (biasIdx !== -1) {
                        const results = dsnTerm.results.splice(biasIdx);
                        const faces = results[0].faces ? results[0].faces : dsnTerm.faces;
                        const newTerm = new HMDie({faces, results});
                        newTerms.push(newTerm);
                    }
                }
            });

            if (r === 5) return dsnTerms.concat(newTerms);
            return dsnTerms;
        };

        const dsnRoll = context.roll.clone();

        const dsnTerms = Roll.simplifyTerms(dsnRoll.terms);
        const srcTerms = Roll.simplifyTerms(context.roll.terms);
        dsnRoll.terms = dsnDecay(srcTerms, dsnTerms);

        dsnRoll.ghost = context.roll.ghost;
        context.dsnRoll = dsnRoll;
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

                const {round} = game?.combat;
                const combatant = combat.getCombatantByToken(token.id);
                if (!combatant || !round) return [];

                const {movespd} = token.actor; // from getter
                movespd.push(Infinity);
                movespd[0] = 0;

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
                tokens.forEach((movedToken) => {
                    const combatant = game.combat.getCombatantByToken(movedToken.id);
                    const roundCurrent = game.combat.round;
                    const movedFlag = combatant.getFlag(SYSTEM_ID, 'moved') || {};
                    const movedRaw = dragRuler.getMovedDistanceFromToken(movedToken);
                    movedFlag[roundCurrent] = parseFloat(movedRaw.toPrecision(4));
                    combatant.setFlag(SYSTEM_ID, 'moved', movedFlag);
                });
            }
        }
        dragRuler.registerSystem(SYSTEM_ID, HMSpeedProvider);
    }
}
