import { HMPrompt } from './prompt.js';

export class AttackPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getAttack.hbs',
            id: 'attackApplication',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        mergeObject(this.dialogData, {
            ranged: dialogData.weapons[0].data.data.ranged.checked,
            widx: 0,
            range: 0,
            advance: dialogData.inCombat,
        });
    }

    update(options) {
        const {weapons, widx} = this.dialogData;
        const {ranged} = weapons[widx].data.data;
        this.dialogData.ranged = ranged.checked;
        super.update(options);
    }

    get dialogResp() {
        const dialogResp = {
            widx: this.dialogData.widx,
            range: Number(this.dialogData.range),
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            advance: Boolean(this.dialogData.advance),
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
