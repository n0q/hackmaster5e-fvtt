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

    Handlebars.registerHelper('inc', (a)    => { return ++a });
    Handlebars.registerHelper('dec', (a)    => { return --a });
    Handlebars.registerHelper('eq',  (a, b) => { return   a  == b });
    Handlebars.registerHelper('neq', (a, b) => { return   a !== b });
    Handlebars.registerHelper('gt',  (a, b) => { return   a  >  b });
    Handlebars.registerHelper('gte', (a, b) => { return   a  >= b });
    Handlebars.registerHelper('lt',  (a, b) => { return   a  <  b });
    Handlebars.registerHelper('lte', (a, b) => { return   a  <= b });

    Handlebars.registerHelper("ishalf", (a, b)   => {
        return a === Math.floor(b/2);
    });

    Handlebars.registerHelper("pad", (a) => {
        let num = a.toString();
        while (num.length < 2) num = "0" + num;
        return num;
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

}
