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

    activateListeners(html) {
        super.activateListeners(html);
        this.update();
        html.submit('#submit', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.object = {
                widx: this.dialogData.widx,
                range: Number(this.dialogData.range),
                bonus: parseInt(this.dialogData.bonus, 10) || 0,
                advance: Boolean(this.dialogData.advance),
            };
            this.options.resolve(this.object);
            this.close();
        });

        html.on('change', '#advance_tracker', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const advance = ev.target.checked;
            this.dialogData.advance = advance;
        });

        html.on('change', '#weapon-select', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const widx = ev.target.value;
            const {ranged} = this.dialogData.weapons[widx].data.data;
            this.dialogData.widx = widx;
            this.dialogData.ranged = ranged.checked;
            this.render();
        });

        html.on('change', '#range-select', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const range = ev.target.value;
            this.dialogData.range = range;
        });

        html.on('change', '#bonus-input', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const bonus = ev.target.value;
            this.dialogData.bonus = bonus;
        });
    }
}
