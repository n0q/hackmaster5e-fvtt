import { isValidBasicAlias } from "./data-utils.js";

export class BasicAliasField extends foundry.data.fields.StringField {
    _validateType(value) {
        if (!isValidBasicAlias(value)) {
            throw new Error(game.i18n.localize("HM.DATA.invalidBasicAlias"));
        }
    }
}

