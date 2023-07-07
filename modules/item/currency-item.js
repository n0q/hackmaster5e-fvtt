import { DEFAULT_ICON_CURRENCY, HMTABLES, SYSTEM_ID } from '../tables/constants.js';
import { HMItem } from './item.js';

const COIN_CFG = HMTABLES.currency;

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
        if (!system?.coins || !Object.entries(system.coins).length) {
            const coins = {};
            Object.keys(COIN_CFG.coins).forEach((coin) => { coins[coin] = {qty: 0}; });
            this.update({'system.coins': coins});
        }
    }

    get _currencyData() {
        const {coins} = this.system;
        const currencyData = {};
        Object.keys(coins).forEach((key) => {
            currencyData[key] = { ...coins[key], ...COIN_CFG.coins[key] };
        });
        return currencyData;
    }

    fromString(input) {
        const coins = getCoinObj();
        const re = /\s+|,|(?=\D)(?<=\d)|(?<=\D)(?=\d)/g;
        const parts = input.split(re).filter(Boolean);

        for (let i = 0; i < parts.length; i += 2) {
            const qty = parseInt(parts[i], 10);
            const coinType = parts[i + 1].toLowerCase();
            if (Object.hasOwn(coins, coinType)) coins[coinType].qty = qty;
        }
        this.update({'system.coins': coins});
    }

    // This exists for a future time when users can move off of the silver standard.
    // eslint-disable-next-line class-methods-use-this
    get standard() {
        return COIN_CFG.standard;
    }

    get value() {
        const coins = this._currencyData;
        return Object.keys(coins).reduce(
            (sum, cType) => sum + (coins[cType]?.qty || 0) * (coins[cType].value || 0),
            0,
        );
    }

    get label() {
        return this.toString({filter: true, html: true});
    }

    toHTML() {
        return this.toString({html: true});
    }

    toString({filter, html} = {}) {
        const cData = this._currencyData;
        const cTypes = Object.keys(cData).sort((a, b) => cData[b].value - cData[a].value);
        const cTypesF = filter ? cTypes.filter((t) => cData[t].qty) : cTypes;

        return html
            ? cTypesF.map((cType) => `<b>${cData[cType].qty.toString()}</b> ${cType}`).join(', ')
            : cTypesF.map((cType) => `${cData[cType].qty.toString()} ${cType}`).join(', ');
    }

    get weight() {
        const currencyWeight = game.settings.get(SYSTEM_ID, 'currencyWeight');
        if (!currencyWeight) return {total: 0, intrinsic: 0};

        const {_currencyData} = this;

        const weightRawTotal = Object.values(_currencyData).reduce(
            (weight, value) => weight + value.qty * value.weight,
            0,
        );

        const weightTotal = Number(weightRawTotal.toPrecision(4));
        return {total: weightTotal, intrinsic: weightTotal};
    }
}

function getCoinObj() {
    const coinTypes = Object.keys(COIN_CFG.coins);
    const coinObj = {};
    for (let i = 0; i < coinTypes.length; i++) {
        const coinType = coinTypes[i];
        coinObj[coinType] = {qty: 0};
    }
    return coinObj;
}
