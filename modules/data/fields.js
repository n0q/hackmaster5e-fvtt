import { isValidBasicObjectBinding, isValidMap } from "./data-utils.js";

export class BasicObjectBindingField extends foundry.data.fields.StringField {
    _validateType(value) {
        if (!isValidBasicObjectBinding(value)) {
            throw new Error(game.i18n.localize("HM.DATA.invalidBasicAlias"));
        }
    }
}

export class MapField extends foundry.data.fields.DataField {
    _cast(value) {
        if (value instanceof Map) return value;
        if (typeof value === "object" && value !== null) {
            return new Map(Object.entries(value));
        }
        return new Map();
    }

    toObject(value) {
        if (!(value instanceof Map)) return {};
        return Object.fromEntries(value);
    }

    _validateType(value) {
        if (!isValidMap(value)) {
            throw new Error("Value must be a Map instance");
        }
    }
}

