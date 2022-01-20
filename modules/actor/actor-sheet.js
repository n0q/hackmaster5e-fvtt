import HMDialogMgr from '../mgr/dialogmgr.js';
import HMChatMgr from '../mgr/chatmgr.js';
import HMRollMgr from '../mgr/rollmgr.js';

export class HMActorSheet extends ActorSheet {

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // ui elements
        html.find('.toggleswitch').click(this._onToggle.bind(this));

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

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".card, .item");
            const item = this.actor.items.get(li.data("itemId"));
            item.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Move Inventory Item
        html.find('.item-state').click(this._onItemState.bind(this));

        // Spell Prep
        html.find('.spell-prep').click(this._onSpellPrep.bind(this));

        // Interactables
        html.find('.button').click(this._onClick.bind(this));
        html.find('.rollable').click(this._onRoll.bind(this));
        html.find('.editable').change(this._onEdit.bind(this));

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
        const element = ev.currentTarget;
        const dataset = element.dataset;
        const type = dataset.type;
        const name = `New ${type.capitalize()}`;

        let data;
        if (dataset.dialog) {
            const dialogMgr = new HMDialogMgr();
            const dialogResp = await dialogMgr.getDialog(dataset, this.actor);
            data = dialogResp.data;
        }

        const itemData = {name, type, data};
        return await Item.create(itemData, {parent: this.actor});
    }

    _updateOwnedItem(item) {
        return this.actor.updateEmbeddedDocuments("Item", item.data);
    }

    async _onToggle(ev) {
        ev.preventDefault();
        const element = ev.currentTarget;
        const target  = $(element).parent().find("[toggle]");
        $(target).toggleClass("hide");
    }

    // Toggle between an item being equipped, carried, or stored.
    async _onItemState(ev) {
        ev.preventDefault();
        const li = $(ev.currentTarget).parents(".card");
        const item = this.actor.items.get(li.data("itemId"));
        const state = item.data.data.state;

        // TODO: This can't possibly stay like this.
        if (state.equipped.checked) { state.equipped.checked = false; } else
        if (state.carried.checked)  { state.carried.checked  = false; } else {
            state.equipped.checked = true;
            state.carried.checked = true;
        }
        await this.actor.updateEmbeddedDocuments("Item", [{_id:item.id, data:item.data.data}]);
    }

    async _onSpellPrep(ev) {
        ev.preventDefault();
        const element     = ev.currentTarget;
        const { dataset } = element;
        const li = $(ev.currentTarget).parents('.card');
        const item = this.actor.items.get(li.data('itemId'));

        let { prepped } = item.data.data || 0;
        dataset.itemPrepare ? prepped++ : prepped--;

        item.data.data.prepped = prepped;
        await this.actor.updateEmbeddedDocuments('Item', [{_id:item.id, data:item.data.data}]);
    }

    _onClick(event) {
        event.preventDefault();
        const item = this._getOwnedItem(this._getItemId(event));
        item.onClick(event);
    }

    async _onEdit(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(this._getItemId(ev));
        if (dataset.itemProp) {
            const itemProp = dataset.itemProp;
            let targetValue = ev.target.value;
            switch (dataset.dtype) {
                case "Number":
                    targetValue = parseInt(targetValue);
                    break;
                case "Float":
                    targetValue = parseFloat(targetValue);
                    break;
            }
            setProperty(item.data, itemProp, targetValue);

            // TODO: Update only the altered property.
           await this.actor.updateEmbeddedDocuments("Item", [{_id:item.id, data:item.data.data}]);
        }
    }

    async _onRoll(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const dataset = element.dataset;
        const actor = this.actor;

        if (dataset.dialog) {
            const dialogMgr = new HMDialogMgr();
            const dialogResp = await dialogMgr.getDialog(dataset, actor);

        let roll = null;
        if (dataset.formula || dataset.formulaType) {
            const rollMgr = new HMRollMgr();
            roll = await rollMgr.getRoll(dataset, dialogResp);
        }

        const chatMgr = new HMChatMgr();
        const card = await chatMgr.getCard(roll, dataset, dialogResp);
        return await ChatMessage.create(card);
        }
    }
}
