import LOGGER from "./logger.js";
import idx from "./localize.js";

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

    Handlebars.registerHelper("findConfigValue", (obj, key) => {
        LOGGER.trace(`Calling findConfigValue Helper | Arg1:${obj} Arg2:${key}`);
        if (obj in idx) {
            return idx[obj][key];
        }
        return "INVALID_KEY";
    });

    Handlebars.registerHelper("findConfigObj", (obj) => {
        LOGGER.trace(`Calling findConfigObj Helper | Arg1:${obj}`);
        if (obj in idx) {
            return idx[obj];
        }
        return "INVALID_LIST";
    });

    // #each.slice(a, b)
    Handlebars.registerHelper("slice", (context, options) => {
        const opt = options.hash;
        const length = context.length
            ? context.length
            : Object.keys(context).length;
        const begin = opt.hasOwnProperty('begin')
            ? parseInt(opt.begin) || 0
            : 0;
        const end = opt.hasOwnProperty('end')
            ? parseInt(opt.end)
            : length;

        let ret = "";
        const data = options.data ? Handlebars.createFrame(options.data) : {};
        const key = Object.keys(context).slice(begin, end);
        for (let i=0; i < key.length; i++) {
            data.key = key[i];
            ret += options.fn(context[key[i]], {data})
        }
        return ret;
    });

    Handlebars.registerHelper("each_split", (context, options) => {
        let delimiter = "</div><div>";
        let slices    = 2;
        const ohash = options.hash;
        if (ohash.hasOwnProperty('delimiter')) {delimiter = ohash['delimiter'];}
        if (ohash.hasOwnProperty('slices')) {slices = ohash['slices'];}

        let ret = "";
        const midpoint = Math.ceil(context.length / slices);
        for (let i = 0, j = context.length; i < j; i++) {
            ret += options.fn(context[i]);
            if ((i + 1) % midpoint === 0) {
                ret += delimiter;
            }
        }
        return ret;
    });
}
