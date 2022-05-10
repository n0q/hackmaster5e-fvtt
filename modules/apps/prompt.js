/* eslint class-methods-use-this: ['error', {'exceptMethods': ['dialogResp', 'getCapList']}] */
import { idx } from '../sys/localize.js';
import { HMCONST } from '../sys/constants.js';

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

    getCapList(capsArr, actor=null) {
        const {special} = idx;
        const capsObj = Object.fromEntries(capsArr.map((x) => Object.entries(special)[x]));
        actor?.canBackstab
            ? capsObj[HMCONST.SPECIAL.FLEEING] = special[HMCONST.SPECIAL.FLEEING]
            : delete capsObj[HMCONST.SPECIAL.BACKSTAB];
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
            const {prop, value} = dataset;
            this.dialogData[prop] = value;
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
