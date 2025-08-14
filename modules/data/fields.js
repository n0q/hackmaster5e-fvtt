import { isValidBasicObjectBinding } from "./data-utils.js";

export class BasicObjectBindingField extends foundry.data.fields.StringField {
    _validateType(value) {
        if (!isValidBasicObjectBinding(value)) {
            throw new Error(game.i18n.localize("HM.DATA.invalidBasicAlias"));
        }
    }
}

