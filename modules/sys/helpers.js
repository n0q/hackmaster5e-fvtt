import { idx } from '../tables/dictionary.js';
import { HMCONST } from '../tables/constants.js';

export const registerHandlebarsHelpers = () => {
    /* eslint-disable no-console */
    Handlebars.registerHelper('toConsole', (obj, level) => {
        const logLevelMapping = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            trace: console.trace,
        };

        const toConsole = logLevelMapping[level] || console.warn;
        toConsole(obj);
    });
    /* eslint-enable no-console */

    Handlebars.registerHelper('concat', (...args) => {
        let outStr = '';
        args.forEach((arg) => {
            if (typeof arg !== 'object') {
                outStr += arg;
            }
        });
        return outStr;
    });

    Handlebars.registerHelper('repeat', (n, block) => new Array(n).fill(null).map(() => block.fn()).join(''));

    Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());

    Handlebars.registerHelper('toUpperCase', (str) => {
        const input = str.toString();
        const lower = input.toLowerCase();
        const upper = lower.charAt(0).toUpperCase();
        return `${upper}${lower.slice(1)}`;
    });

    Handlebars.registerHelper('toggleSwitch', (id, opts) => {
        const { visibleItemId } = opts.data.root.document.sheet;
        let visible = !!visibleItemId[id];
        if (!!opts.hash.invert) visible = !visible;
        if (!visible) return 'hide';
        return undefined;
    });

    Handlebars.registerHelper('HMCONST', (key) => {
        const keyExists = foundry.utils.hasProperty(HMCONST, key);
        if (keyExists) return foundry.utils.getProperty(HMCONST, key);
        return 'INVALID_KEY';
    });

    /**
     * Lookup helper to retrieve a value from nested object path in idx.
     *
     * @param {string} pathString - Path to container object 'foo.bar.baz'
     * @param {string|number} key - Final key to retrieve from idx;
     * @returns {any|string} Found value, or 'INVALID_KEY' if not found.
     */
    Handlebars.registerHelper('findConfigValue', (pathString, key) => {
        if (!pathString || key === undefined) return undefined;
        const pathParts = pathString.split('.');
        const idxChildObj = pathParts.reduce((currentLevel, part) => currentLevel?.[part], idx);
        const finalValue = idxChildObj?.[key];
        return finalValue;
        // HACK: Some templates (like item-cclass-sheet.hbs) assume any return is a valid one.
        // return finalValue === undefined ? 'INVALID_KEY' : finalValue;
    });

    Handlebars.registerHelper('findConfigObj', (obj, opts) => {
        const { omit } = opts.hash;
        if (obj in idx) {
            if (!omit) return idx[obj];
            const { [omit]: _, ...filteredObj } = idx[obj];
            return filteredObj;
        }
        return 'INVALID_KEY';
    });

    Handlebars.registerHelper('findBonus', (arg1, arg2, opts) => {
        const { bonus } = opts.data.root.actor.system;
        const vector = bonus[arg1];
        return foundry.utils.getProperty(vector, arg2);
    });

    Handlebars.registerHelper('mapSelect', (obj1, obj2, suffix) => {
        const cross = Array.isArray(obj1) ? obj1 : Object.values(obj1);
        const label = idx[obj2];

        return { ...cross.map((x, i) => `${game.i18n.localize(label[i])} (${x} ${suffix})`) };
    });

    Handlebars.registerHelper('mergeObjs', (obj1, obj2) => ({ ...obj1, ...obj2 }));

    Handlebars.registerHelper('isGM', () => game.user.isGM);
    Handlebars.registerHelper('getFlag', (scope, key, opts) => opts.data.root.actor.getFlag(scope, key));
    Handlebars.registerHelper('getSetting', (scope, key) => game.settings.get(scope, key));
    Handlebars.registerHelper('eq', (a, b) => a == b); // eslint-disable-line eqeqeq
    Handlebars.registerHelper('neq', (a, b) => a != b); // eslint-disable-line eqeqeq
    Handlebars.registerHelper('ceil', (a) => Math.ceil(a));
    Handlebars.registerHelper('isEven', (a) => (((a % 2) + 2) % 2));

    Handlebars.registerHelper('isHalf', (a, b, opts) => (
        opts.hash.ceil
            ? a === Math.ceil(b / 2)
            : a === Math.floor(b / 2)
    ));

    Handlebars.registerHelper('pad', (arg1) => {
        let num = (arg1 || 0).toString();
        while (num.length < 2) num = `0${num}`;
        return num;
    });

    Handlebars.registerHelper('pct', (arg1) => {
        const pct = Math.round((Number(arg1) || 0) * 100);
        return `${pct}%`;
    });

    Handlebars.registerHelper('getValidContainers', (selectObj, thisId, opts) => {
        const { containerMap } = opts.data.root.actor;
        const blacklist = containerMap.get(thisId) ?? [];

        const srcKeys = Object.keys(selectObj);
        const validKeys = srcKeys.filter((a) => !blacklist.includes(a));
        return validKeys.reduce((acc, i) => {
            acc[i] = selectObj[i];
            return acc;
        }, {});
    });

    Handlebars.registerHelper('objSort', (obj1, key, opts) => {
        const obj2 = opts.hash.obj2 ? opts.hash.obj2 : obj1;
        let sortedKeys = Object.keys(obj2).sort((a, b) => obj2[a][key] - obj2[b][key]);
        if (!!opts.hash.reverse) sortedKeys = sortedKeys.reverse();

        const sortedObj = {};
        sortedKeys.forEach((k) => sortedObj[k] = obj1[k]);
        return sortedObj;
    });

    Handlebars.registerHelper('itemSort', (itemTypes) => {
        const { currency, weapon, armor } = itemTypes;

        const compareNames = (a, b) => a.name.localeCompare(b.name);

        const items = itemTypes.item.sort((a, b) => {
            const container = a.system.container.enabled - b.system.container.enabled;
            return container || compareNames(a, b);
        });

        const weapons = weapon
            .filter((w) => !w.system.innate)
            .sort(compareNames);

        const armors = armor.sort(compareNames);
        const currencies = currency.sort(compareNames);

        return [...weapons, ...armors, ...items, ...currencies];
    });

    Handlebars.registerHelper('delete', (arg1, arg2) => {
        const { [arg2]: _, ...deleted } = arg1;
        return deleted;
    });

    Handlebars.registerHelper('repeat', function _(count, opts) {
        let str = '';

        if (count) {
            for (let i = 0; i < count; i++) {
                const data = { index: i };
                str += opts.fn(this, data);
            }
        } else str = opts.inverse(this);
        return str;
    });
};
