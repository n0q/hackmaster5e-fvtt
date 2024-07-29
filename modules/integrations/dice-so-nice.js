/**
 * @file Support functions for dice-so-nice.
 */
import { HMDie } from '../sys/dice.js';

/**
 * Handles 'diceSoNiceRollStart' hook events.
 * @param {any} _ - Unused.
 * @param {object} context - Dice roll data.
 */
export function diceSoNiceRollStartHandler(_, context) {
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
