/* eslint class-methods-use-this: ['error', {'exceptMethods': ['dialogResp']}] */

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

        html.submit('#submit', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.update({render: false});
            this.options.resolve(this.dialogResp);
            this.close();
        });

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
