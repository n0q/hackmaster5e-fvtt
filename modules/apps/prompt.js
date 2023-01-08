/* eslint class-methods-use-this: ['error', {'exceptMethods': ['dialogResp', 'getCapList']}] */
import { idx } from '../tables/dictionary.js';
import { HMCONST } from '../tables/constants.js';

export class HMPrompt extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form', 'dialog'],
            popOut: true,
            minimizable: false,
            width: 400,
        });
    }

    constructor(dialogData, options) {
        super();
        mergeObject(this.options, options);
        this.dialogData = dialogData;
    }

    getCapList(weapon, actor=null) {
        const isDefend = this.constructor.name === 'DefendPrompt';
        const isRanged = weapon.system.ranged.checked;

        const capsArr = isDefend
            ? weapon.capabilities.filter((x) => x >= 64)
            : weapon.capabilities.filter((x) => x <  64);

        const {special} = idx;
        const capsObj = Object.fromEntries(capsArr.map((x) => [x, special[x]]));

        if (actor.canBackstab && !isRanged && !isDefend) {
            capsObj[HMCONST.SPECIAL.FLEEING] = special[HMCONST.SPECIAL.FLEEING];
        }

        return capsObj;
    }

    getData() {
        return this.dialogData;
    }

    update({render}) {
        if (render) this.render();
    }

    get dialogResp() {
        return {};
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.ready(() => html.find('.focus').focus());

        html.on('click', '.dialog-button', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const {dataset} = ev.currentTarget;
            const {prop, value, button} = dataset;

            if (prop) this.dialogData[prop] = value;
            if (button) this.dialogData.button = button;
            this.update({render: false});
            this.options.resolve(this.dialogResp);
            this.close();
        });

        // TODO: Better types handling
        html.on('change', '.bind', async (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const {dataset} = ev.currentTarget;
            const {checked, type, value} = ev.target;
            const {render, prop} = dataset;
            this.dialogData[prop] = type === 'checkbox' ? checked : value;
            this.update({render});
        });
    }
}
