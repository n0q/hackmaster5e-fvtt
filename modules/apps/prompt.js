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

    activateListeners(html) {
        super.activateListeners(html);
        html.ready(() => html.find('.focus').focus());
    }
}
