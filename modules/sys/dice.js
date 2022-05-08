/* eslint-disable */
/**
 * Adds the 'p' (for 'penetrate') modifier to die rolls.
 * This is similar to 'exploding' dice, but each 'exploded' die has 1 subtracted from it.
 * So, for a d6p, if you rolled 6, 6, 1, the total result would be 6+5+0=11.
 * d20p penetrate into d6p, d100p penetrate into d20p
 */

// TODO: use hooks?

Die.MODIFIERS['p'] = 'penetrate';
Die.prototype.penetrate = function(modifier, {recursive=true}={}) {
    // Match the penetration modifier
    const rgx = /p([0-9]+)?([<>=]+)?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if ( !match ) return false;
    let [max, comparison, target] = match.slice(1);

    // If no comparison or target are provided, treat the max as the target
    if ( max && !(target || comparison) ) {
      target = max;
      max = null;
    }

    // Determine target values
    target = Number.isNumeric(target) ? parseInt(target) : this.faces;
    comparison = comparison || "=";
    max = Number.isNumeric(max) ? parseInt(max) : null;

    let penetrate_faces = this.faces;
    if (this.faces === 100) { penetrate_faces = 20; } else
    if (this.faces === 20)  { penetrate_faces = 6;  }

    // Recursively penetrate until there are no remaining results to penetrate
    let i = 0;
    let checked = 0;
    let initial = this.results.length;
    let new_results = [];
    while ( i < this.results.length ) {
      let r = this.results[i];
      new_results.push(r);
      i++;
      checked++;
      if (!r.active) continue;

      // Maybe we have run out of penetrations
      if ( (max !== null) && (max <= 0) ) break;
      // Determine whether to penetrate the result and roll again!
      if (this.faces > 1 && DiceTerm.compareResult(r.result, comparison, target) ) {
        r.penetrated = true;

        while (true) {
          // Limit recursion
          if ( ++checked > 1000 ) throw new Error("Maximum recursion depth for penetrating dice roll exceeded (2)");

          let reroll_num = Math.ceil((CONFIG.Dice.randomUniform() * penetrate_faces));
          let reroll = {result: reroll_num - 1, active: true, faces: penetrate_faces};
          new_results.push(reroll);

          // TODO: There's an odd interaction with rolling something like 1d20p>=19
          // This is my best and temporary fix, but it's hacky
          if (recursive && DiceTerm.compareResult(reroll_num, comparison, Math.min(target, penetrate_faces))) {
            reroll.penetrated = true;
          }
          else {
            break;
          }
        }
        if ( max !== null ) max -= 1;
      }

      // Limit recursion
      if ( checked > 1000 ) throw new Error("Maximum recursion depth for penetrating dice roll exceeded");
    }

    // If we broke out early just add the rest of the results to the new_results list
    while (i < this.results.length) {
      let r = this.results[checked];
      new_results.push(r);
      i++;
    }
    this.results = new_results;
};

// Change the CSS of the DiceTerm based on the faces of the die rolled
// This means that d100p->d20p and d20p->d6p is properly displayed
DiceTerm.prototype.getResultCSS = function(result) {
  const hasSuccess = result.success !== undefined;
  const hasFailure = result.failure !== undefined;
  const isMax = result.result === this.faces;
  const isMin = result.result === 1;
  return [
    this.constructor.name.toLowerCase(),
    "d" + (result.faces ? result.faces : this.faces),
    result.success ? "success" : null,
    result.failure ? "failure" : null,
    result.rerolled ? "rerolled" : null,
    result.penetrated ? "exploded" : null,
    result.discarded ? "discarded" : null,
    !(hasSuccess || hasFailure) && isMin ? "min" : null,
    !(hasSuccess || hasFailure) && isMax ? "max" : null
  ]
}
