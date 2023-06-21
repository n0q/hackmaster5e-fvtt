import { DEFAULT_ICON_CURRENCY, HMTABLES } from '../tables/constants.js';
import { HMItem } from './item.js';

export class HMCurrencyItem extends HMItem {
    static DEFAULT_ICON = DEFAULT_ICON_CURRENCY;

    prepareBaseData() {
        super.prepareBaseData();
        this._prepCurrencyData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    _prepCurrencyData() {
        const {system} = this;
        if (!Object.entries(system._dim).length) {
            system._dim = HMTABLES.currency._dim;
            system.coin = {};
            Object.keys(system._dim).forEach((dim) => { system.coin[dim] = {qty: 0}; });
            this.update({'system': system});
        }
    }

    fromString(input) {
        const coin = this.getCoinObj();
        const re = /\s+|,|(?=\D)(?<=\d)|(?<=\D)(?=\d)/g;
        const parts = input.split(re).filter(Boolean);

        for (let i = 0; i < parts.length; i += 2) {
            const qty = parseInt(parts[i], 10);
            const coinType = parts[i + 1].toLowerCase();
            if (Object.hasOwn(coin, coinType)) coin[coinType].qty = qty;
        }
        this.update({'system.coin': coin});
    }

    get label() {
        return this.toString({filter: true, html: true});
    }

    toHTML() {
        return this.toString({html: true});
    }

    toString({filter, html} = {}) {
        const {_dim, coin} = this.system;
        const coinTypes = Object.keys(_dim).sort((a, b) => _dim[b].value - _dim[a].value);
        const coinTypesF = filter ? coinTypes.filter((t) => coin[t].qty) : coinTypes;
        return html
            ? coinTypesF.map((cType) => `<b>${coin[cType].qty.toString()}</b> ${cType}`).join(', ')
            : coinTypesF.map((cType) => `${coin[cType].qty.toString()} ${cType}`).join(', ');
    }

    get weight() {
        const {_dim, coin} = this.system;
        const weightRawTotal = Object.keys(coin).reduce(
            (weight, type) => weight + coin[type].qty * _dim[type].weight,
            0,
        );
        const weightTotal = Number(weightRawTotal.toPrecision(4));
        return {total: weightTotal, intrinsic: weightTotal};
    }

    getCoinObj() {
        const {_dim} = this.system;
        const coinTypes = Object.keys(_dim);
        const coinObj = {};
        for (let i = 0; i < coinTypes.length; i++) {
            const coinType = coinTypes[i];
            coinObj[coinType] = {qty: 0};
        }
        return coinObj;
    }
}
