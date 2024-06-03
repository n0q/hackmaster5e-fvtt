/* eslint-disable */
export class HMDie extends Die {
    static MODIFIERS = {...this.MODIFIERS, p: 'penetrate'};

    get total() {
        const rv = super.total;
        if (!rv) return rv;
        return this.results.reduce((t, r) => t + (r.bias ?? 0), rv);
    }

    async roll({minimize=false, maximize=false, bias=false, faces=false}={}) {
        const roll = await super.roll({minimize, maximize});
        this.results[this.results.length -1] = roll;

        if (faces) {
            roll.faces = faces;
            roll.result = Math.ceil(CONFIG.Dice.randomUniform() * faces);
        }

        if (bias) roll.bias = bias;
        return roll;
    }

    async penetrate(modifier, {recursive=true}={}) {
        // Match the "penetrate" modifier
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
        if (target === 1) max = 0;

        // Determine the number of allowed penetrations
        max = Number.isNumeric(max) ? parseInt(max, 10) : null;

        // Dice decay
        let pFaces = false;
        if (this.faces === 100) { pFaces = 20; } else
        if (this.faces === 20)  { pFaces = 6;  }

        // Recursively penetrate until there are no remaining results to penetrate
        let checked = 0;
        const initial = this.results.length;

        while (checked < this.results.length) {
            const r = this.results[checked];
            checked++;
            if (!r.active) continue;

            // Maybe we have run out of penetrations
            if ((max !== null) && (max <= 0)) break;

            // Determine whether to penetrate the result and roll again!
            if (r.faces) target = r.faces;

            if (foundry.dice.terms.DiceTerm.compareResult(r.result, comparison, target)) {
                r.penetrated = true;
                await this.roll({faces: pFaces, bias: -1});
                if (max !== null) max -= 1;
            }

            // Limit recursion
            if (!recursive && (checked === initial)) break;
            if (checked > 1000) throw new Error('Maximum recursion depth for exploding dice roll exceeded');
        }
    }

    getResultLabel(result) {
        return String(result.result + (result?.bias || 0));
    }

    getResultCSS(result) {
        const rv = super.getResultCSS(result);
        rv[1] = `d${result.faces ?? this.faces}`;
        rv[5] = result.penetrated ? 'penetrated' : rv[5];
        rv[8] = result.result === (result.faces ?? this.faces) ? 'max' : null;
        return rv;
    }
}
