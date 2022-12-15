import LOGGER from './logger.js';
import idx from '../tables/dictionary.js';

export default function registerHandlebarsHelpers() {
    Handlebars.registerHelper('concat', function() {
        let outStr = '';
        for (const arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());

    Handlebars.registerHelper('toUpperCase', (str) => {
        const input = str.toString();
        const lower = input.toLowerCase();
        const upper = lower.charAt(0).toUpperCase();
        return `${upper}${lower.slice(1)}`;
    });

    Handlebars.registerHelper('toggleSwitch', (id, opts) => {
        const {visibleItemId} = opts.data.root.document.sheet;
        let visible = !!visibleItemId[id];
        if (!!opts.hash.invert) visible = !visible;
        if (!visible) return 'hide';
    });

    Handlebars.registerHelper('findConfigValue', (obj, key) => {
        LOGGER.trace(`Calling findConfigValue Helper | Arg1:${obj} Arg2:${key}`);
        if (obj in idx) return idx[obj][key];
        return 'INVALID_KEY';
    });

    Handlebars.registerHelper('findConfigObj', (obj, opts) => {
        const {omit} = opts.hash;
        if (obj in idx) {
            if (!omit) return idx[obj];
            const {[omit]: _, ...filteredObj} = idx[obj];
            return filteredObj;
        }
        return 'INVALID_KEY';
    });

    Handlebars.registerHelper('findBonus', (arg1, arg2, opts) => {
        const {bonus} = opts.data.root.actor.system;
        const vector = bonus[arg1];
        return getProperty(vector, arg2);
    });

    Handlebars.registerHelper('mapSelect', (obj1, obj2, suffix) => {
        const cross = Array.isArray(obj1) ? obj1 : Object.values(obj1);
        const label = idx[obj2];

        return {...cross.map((x, i) => `${game.i18n.localize(label[i])} (${x} ${suffix})`)};
    });

    Handlebars.registerHelper('isGM', () => game.user.isGM);
    Handlebars.registerHelper('getFlag', (scope, key, opts) => opts.data.root.actor.getFlag(scope, key));
    Handlebars.registerHelper('getSetting', (scope, key) => game.settings.get(scope, key));
    Handlebars.registerHelper('eq', (a, b) => a == b);
    Handlebars.registerHelper('neq', (a, b) => a != b);

    Handlebars.registerHelper('isHalf', (a, b, opts) => {
        return opts.hash.ceil
            ? a === Math.ceil(b/2)
            : a === Math.floor(b/2);
    });

    Handlebars.registerHelper('pad', (arg1) => {
        let num = (arg1 || 0).toString();
        while (num.length < 2) num = `0${num}`;
        return num;
    });

    Handlebars.registerHelper('pct', (arg1) => {
        const pct = Math.round((Number(arg1) || 0) * 100);
        return `${pct}%`;
    });

    Handlebars.registerHelper('repeat', function (count, opts) {
        let str = '';

        if (count) {
            for (let i = 0; i < count; i++) {
                const data = {index: i};
                str += opts.fn(this, data);
            }
        } else {
            str = opts.inverse(this);
        }

        return str;
    });
}
