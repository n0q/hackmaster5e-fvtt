import { HMPrompt } from './prompt.js';

export class FumblePrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/fumble.hbs',
            id: 'fumblePrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);

        foundry.utils.mergeObject(this.dialogData, {
            atk: undefined,
            def: undefined,
            type: 0,
            innate: false,
        });
    }

    update(options) {
        super.update(options);
    }

    get dialogResp() {
        const {atk, def, innate, type} = this.dialogData;
        const dialogResp = {
            atk: Number(atk),
            def: Number(def),
            type: +type,
            innate,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
