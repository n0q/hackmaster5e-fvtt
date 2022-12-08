import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMRollMgr } from '../mgr/rollmgr.js';
import { HMTABLES, MODULE_ID } from '../tables/constants.js';

export class HMActorSheet extends ActorSheet {
    visibleItemId = {};

    /** @override */
    get template() {
        const path = 'systems/hackmaster5e/templates/actor';
        return `${path}/${this.actor.type}-base.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ['String', 'Number', 'Boolean'];

        this._prepareBaseItems(data);
        this._HMprepareSheet(data);
        return data;
    }

    _prepareBaseItems(sheetData) {
        const actorData = sheetData.actor;

        const {spell} = actorData.itemTypes;
        const gear = {weapons: [], armors: [], items: []};
        const armors = {owned: [], carried: [], equipped: []};
        const weapons = {owned: [], carried: [], equipped: [], innate: []};
        const skills = {uskills: [], oskills: [], iskills: []};

        actorData.itemTypes.skill.forEach((i) => {
            if (i.system.language) {
                skills.iskills.push(i);
                return;
            }

            if (actorData.type !== 'character' || !i.system.universal) {
                skills.oskills.push(i);
                return;
            }

            skills.uskills.push(i);
        });

        actorData.itemTypes.armor.forEach((i) => {
            gear.armors.push(i);
            const state = HMTABLES.itemstate[(i.system.state)];
            armors[state].push(i);
        });

        actorData.itemTypes.weapon.forEach((i) => {
            gear.weapons.push(i);
            const state = HMTABLES.itemstate[(i.system.state)];
            weapons[state].push(i);
        });

        gear.items = actorData.itemTypes.item.sort((a, b) => a.name.localeCompare(b.name));

        function skillsort(a, b) {
            return `${game.i18n.localize(a.name)} ${a.system.specialty.value || ''}`
                 > `${game.i18n.localize(b.name)} ${b.system.specialty.value || ''}` ? 1 : -1;
        }

        Object.keys(skills).forEach((skillType) => skills[skillType].sort(skillsort));

        actorData.skills = skills;
        actorData.armors = armors;
        actorData.weapons = weapons;
        actorData.gear = gear;
        actorData.spells = spell.sort(
            (a, b) => Number(a.system.lidx) - Number(b.system.lidx) || a.name.localeCompare(b.name),
        );

        actorData.talents = actorData.itemTypes.talent.sort((a, b) => a.name.localeCompare(b.name));

        const slevels = [];
            for (let i=0; i < actorData.spells.length; i++) {
                const lidx = Number(actorData.spells[i].system.lidx);
                if (!slevels.includes(lidx)) { slevels.push(lidx); }
            }

        actorData.slevels = slevels.sort();

        // If sheet has only one spell level, the controls are locked.
        if (slevels.length === 1) actorData.system.cslevel = actorData.slevels[0];
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // ui elements
        html.find('.toggleswitch header').click(this._onToggle.bind(this));

        if (!this.options.editable) return;
        // ----------------------------------------------------- //

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".card, .item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // Delete Item
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.card, .item');
            const item = this.actor.items.get(li.data('itemId'));
            const title = `${game.i18n.localize('HM.confirmation')}: ${item.name}`;
            const content = `<p>${game.i18n.localize('HM.dialog.deleteBody')} <b>${item.name}</b>?</p>`;

            Dialog.confirm({
                title,
                content,
                yes: () => {
                    item.delete();
                    li.slideUp(200, () => this.render(false));
                },
                defaultYes: false,
            });
        });

        // Move Inventory Item
        html.find('.item-state').click(this._onItemState.bind(this));

        // Spell Prep
        html.find('.spell-prep').click(this._onSpellPrep.bind(this));

        // Interactables
        html.find('.button').click(this._onClick.bind(this));
        html.find('.txtbutton').click(this._onClick.bind(this));
        html.find('.rollable').click(this._onRoll.bind(this));
        html.find('.editable').change(this._onEdit.bind(this));
        html.find('.selectable').change(this._onSelect.bind(this));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    // Getters
    _getItemId(event) {
        let id = $(event.currentTarget).parents(".card, .item").attr("data-item-id");
        if (typeof id === "undefined") id = $(event.currentTarget).attr("data-item-id");
        return id;
    }

    _getOwnedItem(itemId) { return this.actor.items.get(itemId); }
    _getObjProp(event) { return $(event.currentTarget).attr("data-item-prop"); }

    async _onItemCreate(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        const {type} = dataset;
        const itemName = `New ${type.capitalize()}`;

        const itemData = {name: itemName, type};
        if (dataset.dialog) {
            const dialogMgr = new HMDialogMgr();
            const dialogResp = await dialogMgr.getDialog(dataset, this.actor);
            itemData.data = dialogResp.data;
        }

        const newItem = await Item.create(itemData, {parent: this.actor});
        if (dataset.render === 'true') newItem.sheet.render(true);
    }

    _updateOwnedItem(item) {
        return this.actor.updateEmbeddedDocuments("Item", item.data);
    }

    async _onToggle(ev) {
        ev.preventDefault();
        const cId = this._getItemId(ev);

        const tState = !this.visibleItemId[cId];
        this.visibleItemId[cId] = tState;

        const element = ev.currentTarget;
        const target  = $(element).parent().parent().find('[toggle]');
        $(target).toggleClass('hide');
    }

    // Toggle between an item being equipped, carried, or stored.
    async _onItemState(ev) {
        ev.preventDefault();
        const li = $(ev.currentTarget).parents('.card');
        const item = this.actor.items.get(li.data('itemId'));
        const {system} = item;
        system.state = (++system.state || 0) % 3;
        await this.actor.updateEmbeddedDocuments('Item', [{_id:item.id, system}]);
    }

    async _onSpellPrep(ev) {
        ev.preventDefault();
        const element = ev.currentTarget;
        const {dataset} = element;
        const li = $(ev.currentTarget).parents('.card');
        const item = this.actor.items.get(li.data('itemId'));
        const {system} = item;

        let {prepped} = item.system || 0;
        dataset.itemPrepare ? prepped++ : prepped--;
        system.prepped = prepped;

        await this.actor.updateEmbeddedDocuments('Item', [{_id:item.id, system}]);
    }

    _onClick(ev) {
        ev.preventDefault();
        const item = this._getOwnedItem(this._getItemId(ev));
        item.onClick(ev);
        const {dataset} = ev.currentTarget;
        if (dataset.toggle) {
            const id = this._getItemId(ev);
            const {visibleItemId} = this;
            visibleItemId[id] = !visibleItemId[id];
        }
    }

    async _onSelect(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const {dataset, value} = ev.currentTarget;
        const {flag} = dataset;
        if (flag) this.actor.setFlag(MODULE_ID, flag, value);
    }

    async _onEdit(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(this._getItemId(ev));
        if (dataset.itemProp) {
            const {itemProp, dtype} = dataset;
            let targetValue = ev.target.value;
            if (dtype === 'Number') { targetValue = parseInt(targetValue, 10); } else
            if (dtype === 'Float')  { targetValue = parseFloat(targetValue);   } else
            if (dtype === 'Percent') {
                const pctMatch = targetValue.match(/^([0-9]+)%$/);
                const floatMatch = targetValue.match(/^([0-9]?\.[0-9]+)$/);
                if (pctMatch)   { targetValue = parseFloat(pctMatch[1]) / 100;   } else
                if (floatMatch) { targetValue = parseFloat(floatMatch[1]);       } else
                                { targetValue = parseInt(targetValue, 10) / 100; }
            }
            setProperty(item, itemProp, targetValue);

            // TODO: Update only the altered property.
           await this.actor.updateEmbeddedDocuments("Item", [{_id:item.id, data:item.system}]);
        }
    }

    async _onRoll(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const {dataset} = element;
        const {actor} = this;

        if (dataset.dialog === 'atk' || dataset.dialog === 'ratk') {
            return game[MODULE_ID].HMWeaponItem.rollAttack({weapon: dataset.itemId, caller: actor});
        }

        if (dataset.dialog === 'dmg') {
            return game[MODULE_ID].HMWeaponItem.rollDamage({weapon: dataset.itemId, caller: actor});
        }

        if (dataset.dialog === 'def') {
            return game[MODULE_ID].HMWeaponItem.rollDefend({weapon: dataset.itemId, caller: actor});
        }

        if (dataset.dialog === 'skill') {
            return game[MODULE_ID].HMItem.rollSkill({itemId: dataset.itemId, caller: actor});
        }

        if (dataset.dialog === 'cast') {
            return game[MODULE_ID].HMSpellItem.rollSpell({spell: dataset.itemId, caller: actor});
        }

        if (dataset.dialog) {
            const dialogMgr = new HMDialogMgr();
            const dialogResp = await dialogMgr.getDialog(dataset, actor);

            let roll = null;
            if (dataset.formula || dataset.formulaType) {
                const rollMgr = new HMRollMgr();
                roll = await rollMgr.getRoll(dataset, dialogResp);
            }

            const chatMgr = new HMChatMgr();
            const card = await chatMgr.getCard({roll, dataset, dialogResp});
            return ChatMessage.create(card);
        }
    }
}
