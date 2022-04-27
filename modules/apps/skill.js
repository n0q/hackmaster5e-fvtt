import { HMPrompt } from './prompt.js';

export class SkillPrompt extends HMPrompt {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'systems/hackmaster5e/templates/dialog/getSkill.hbs',
            id: 'skillPrompt',
        });
    }

    constructor(dialogData, options) {
        super(dialogData, options);
        const {data} = this.dialogData.skill.data;
        mergeObject(this.dialogData, {
            dc: 'auto',
            language: data.language,
            hasVerbal: data.bonus.total.verbal > 0,
            hasLiteracy: data.bonus.total.literacy > 0,
        });
    }

    update(options) {
        super.update(options);
    }

    get dialogResp() {
        const dialogResp = {
            dc: this.dialogData.dc,
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
