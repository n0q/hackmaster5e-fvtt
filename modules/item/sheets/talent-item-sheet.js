import { HMItemSheet } from './item-sheet.js';

function getRowAttr(ev, attrName) {
    const el = ev.currentTarget;
    return $(el).parents('tr').attr(attrName);
}

export class HMTalentItemSheet extends HMItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'item'],
            width: 580,
            height: 380,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'attributes' }],
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;
        html.find('.wtalent').on('click', this.onSetWeaponTalent.bind(this));
        html.find('.add-effect').on('click', this.onAddEffectTalent.bind(this));
        html.find('.delete-effect').on('click', this.onDeleteEffectTalent.bind(this));
        html.find('.edit-effect').on('change', this.onEditEffectTalent.bind(this));
    }

    onSetWeaponTalent(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        if (dataset.key) this.item.setWeaponTalent(dataset.key);
    }

    async onAddEffectTalent(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if ($(ev.currentTarget).attr('disabled')) return;

        const {item} = this;
        const effect = item.effects.get(getRowAttr(ev, 'data-effect-id'));
        const {changes} = effect;
        const changeObj = {key: '', value: '0', mode: CONST.ACTIVE_EFFECT_MODES.ADD};
        changes.push(changeObj);
        await effect.update({changes});
    }

    async onDeleteEffectTalent(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if ($(ev.currentTarget).attr('disabled')) return;

        const {item} = this;
        const eIdx = Number(getRowAttr(ev, 'data-effect-idx'));
        const effect = item.effects.get(getRowAttr(ev, 'data-effect-id'));
        const {changes} = effect;
        if (changes.length === 1) return;

        const title = `${game.i18n.localize('HM.confirmation')}: ${item.name}`;
        const content = `<p>${game.i18n.localize('HM.dialog.deleteBody')} effect?</p>`;
        const tr = $(ev.currentTarget).parents('tr');

        Dialog.confirm({
            title,
            content,
            yes: () => {
                changes.splice(eIdx, 1);
                tr.slideUp(200, () => this.render(false));
                effect.update({changes});
            },
            defaultYes: false,
        });
    }

    async onEditEffectTalent(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const {dataset} = ev.currentTarget;
        const {item} = this;

        const eIdx = Number(getRowAttr(ev, 'data-effect-idx'));
        const effect = item.effects.get(getRowAttr(ev, 'data-effect-id'));
        const {changes} = effect;
        const {editKey} = dataset;
        changes[eIdx][editKey] = ev.target.value;
        await effect.update({changes});
    }
}
