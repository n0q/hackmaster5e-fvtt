export class HMDie extends Die {
    static MODIFIERS = {...this.MODIFIERS, p: 'penetrate'};

    roll({minimize=false, maximize=false, faces=false, adjust=false}={}) {
        const roll = super.roll({minimize, maximize});
        this.results[this.results.length -1] = roll;

        if (faces) {
            roll.faces = faces;
            roll.result = Math.ceil(CONFIG.Dice.randomUniform() * faces);
        }

        if (adjust) {
            roll.adjust = adjust;
            roll.result += adjust;
        }
        return roll;
    }

    penetrate(modifier, {recursive=true}={}) {
        // Match the "explode" or "explode once" modifier
        const rgx = /p([0-9]+)?([<>=]+)?([0-9]+)?/i;
        const match = modifier.match(rgx);
        if (!match) return false;
        let [max, comparison, target] = match.slice(1);

        // If no comparison or target are provided, treat the max as the target value
        if (max && !(target || comparison)) {
            target = max;
            max = null;
        }

        // Determine target values
        target = Number.isNumeric(target) ? parseInt(target, 10) : this.faces;
        comparison = comparison || '=';

        // Determine the number of allowed explosions
        max = Number.isNumeric(max) ? parseInt(max, 10) : null;

        // Dice decay

        let pFaces = false;
        if (this.faces === 100) { pFaces = 20; } else
        if (this.faces === 20)  { pFaces = 6;  }

        // Recursively explode until there are no remaining results to explode
        let checked = 0;
        const initial = this.results.length;
        while (checked < this.results.length) {
            const r = this.results[checked];
            checked++;
            if (!r.active) continue;

            // Maybe we have run out of explosions
            if ((max !== null) && (max <= 0)) break;

            // Determine whether to explode the result and roll again!
            if (DiceTerm.compareResult(r.result - (r?.adjust || 0), comparison, target)) {
                r.penetrated = true;
                this.roll({faces: pFaces, adjust: -1});
                if (max !== null) max -= 1;
            }

            // Limit recursion
            if (!recursive && (checked === initial)) break;
            if (checked > 1000) throw new Error('Maximum recursion depth for exploding dice roll exceeded');
        }
    }

    getResultCSS(result) {
        const resultCopy = deepClone(result);
        resultCopy.result -= resultCopy?.adjust || 0;
        const rv = super.getResultCSS(resultCopy);
        rv[1] = `d${result.faces ?? this.faces}`;
        rv[5] = resultCopy.penetrated ? 'exploded' : rv[5];
        return rv;
    }
}
