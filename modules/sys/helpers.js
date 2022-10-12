import LOGGER from './logger.js';
import idx from './dictionary.js';

export default function registerHandlebarsHelpers() {
    LOGGER.log("Calling Register Handlebars Helpers");

    Handlebars.registerHelper('concat', function() {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('toLowerCase', function(str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper('sanitize', function(str) {
        return DOMPurify.sanitize(str);
    });

    Handlebars.registerHelper('findConfigValue', (obj, key) => {
        LOGGER.trace(`Calling findConfigValue Helper | Arg1:${obj} Arg2:${key}`);
        if (obj in idx) return idx[obj][key];
        return 'INVALID_KEY';
    });

    Handlebars.registerHelper('findConfigObj', (obj) => {
        LOGGER.trace(`Calling findConfigObj Helper | Arg1:${obj}`);
        if (obj in idx) return idx[obj];
        return 'INVALID_LIST';
    });

    Handlebars.registerHelper('findBonus', (arg1, arg2, opts) => {
        const {bonus} = opts.data.root.actor.system;
        const vector = bonus[arg1];
        return getProperty(vector, arg2);
    });

    Handlebars.registerHelper('eq', (a, b) => { return a == b });
    Handlebars.registerHelper('neq', (a, b) => { return a != b });

    Handlebars.registerHelper("ishalf", (a, b)   => {
        return a === Math.floor(b/2);
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

    Handlebars.registerHelper("repeat", function (count, opts) {
        let str = "";

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
