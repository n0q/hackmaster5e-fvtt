import { HMPrompt } from './prompt.js';
import { HMCONST } from '../tables/constants.js';

export class SkillPrompt extends HMPrompt {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getSkill.hbs',
            id: 'skillPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const {system} = this.dialogData.skill;
        foundry.utils.mergeObject(this.dialogData, {
            dc: HMCONST.SKILL.DIFF.AUTO,
            language: system.language,
            hasVerbal: system.bonus.total.verbal > 0,
            hasLiteracy: system.bonus.total.literacy > 0,
        });
    }

    update(options) {
        super.update(options);
    }

    get dialogResp() {
        const dialogResp = {
            dc: Number(this.dialogData.dc),
            rollMode: this.dialogData.rollMode,
            bonus: parseInt(this.dialogData.bonus, 10) || 0,
            formulaType: this.dialogData.formulaType,
        };
        return dialogResp;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
