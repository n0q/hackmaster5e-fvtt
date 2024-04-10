import { HMCONST, HMTABLES } from '../tables/constants.js';
import { HMPrompt } from './prompt.js';

export class WoundPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/wound.hbs',
            id: 'woundPrompt',
            width: 275,
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);

        foundry.utils.mergeObject(this.dialogData, {
            hp: null,
            armorDamage: null,
            assn: null,
            isEmbedded: false,
            embed: HMCONST.RANGED.EMBED.AUTO,
            note: undefined,
        });
    }

    update(options) {
        super.update(options);
    }

    get dialogResp() {
        const {armorDamage, assn, embed, note} = this.dialogData;
        const hp = parseInt(this.dialogData.hp, 10) || 0;
        const isEmbedded = !!this.dialogData.isEmbedded && !!hp;

        const embedLevel = embed === HMCONST.RANGED.EMBED.AUTO
            ? HMTABLES.weapons.ranged.embed(hp)
            : parseInt(embed, 10);

        const dialogResp = {
            hp,
            isEmbedded,
            embed: embedLevel,
            armorDamage: parseInt(armorDamage, 10) || 0,
            assn: parseInt(assn, 10) || 0,
            note,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
