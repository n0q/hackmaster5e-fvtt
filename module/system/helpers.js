import LOGGER from "../utils/logger.js";
import idx from "../utils/localize.js";

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

}
