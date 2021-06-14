import HMDialogMgr from "../sys/dialogmgr.js";
import HMChatMgr from "../sys/chatmgr.js";
import HMRollMgr from "../sys/rollmgr.js";

export class HMActorSheet extends ActorSheet {

    /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // ui elements
    html.find('.toggle').click(this._onToggle.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".card");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".card");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Move Inventory Item
    html.find('.item-state').click(this._onItemState.bind(this));

    html.find('.spell-state').click(this._onSpellState.bind(this));

    // Rollable abilities.
    html.find('.wound').click(this._onEditWound.bind(this));
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
        let id = $(event.currentTarget).parents(".item").attr("data-item-id");
        if (typeof id === "undefined") {
            id = $(event.currentTarget).attr("data-item-id");
        }
        return id;
    }

    _getOwnedItem(itemId) { return this.actor.items.get(itemId); }

    _getObjProp(event) { return $(event.currentTarget).attr("data-item-prop"); }


  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            data: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.data["type"];

        // Finally, create the item!
        return await Item.create(itemData, {parent: this.actor});
    }

    _updateOwnedItem(item) {
        return this.actor.updateEmbeddedDocuments("Item", item.data);
    }

    async _onToggle(ev) {
        ev.preventDefault();
        const element = ev.currentTarget;
        const id      = this._getItemId(ev);
        const target  = $(element).find("[data-toggle='" + id + "']");
        for (let i = 0; i < target.length; i++) {
            $(target[i]).toggleClass("hide");
        }
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

    async _onSpellState(ev) {
        ev.preventDefault();
        const li = $(ev.currentTarget).parents(".card");
        const item = this.actor.items.get(li.data("itemId"));
        const prepped = item.data.data.prepared;
        prepped.checked = !prepped.checked;
        await this.actor.updateEmbeddedDocuments("Item", [{_id:item.id, data:item.data.data}]);
    }

    async _onEditWound(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(this._getItemId(event));

        if (dataset.itemProp) {
            const itemProp = dataset.itemProp;
            let propValue = getProperty(item.data, itemProp);
            if (--propValue < 1 && dataset.itemProp === "data.duration.value") {
                let hpValue = getProperty(item.data, "data.hp.value");
                hpValue = Math.max(hpValue -1, 0);
                propValue = hpValue;
                setProperty(item.data, "data.hp.value", hpValue);
            }
            setProperty(item.data, itemProp, propValue);

            // TODO: Update only the altered property.
            await this.actor.updateEmbeddedDocuments("Item", [{_id:item.id, data:item.data.data}]);
        }
    }

    async _onEdit(event) {
        event.preventDefault();
        event.stopPropagation();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(this._getItemId(event));
        if (dataset.itemProp) {
            const itemProp = dataset.itemProp;
            let targetValue = event.target.value;
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

   /**
    * Handle clickable rolls.
    * @param {Event} event   The originating click event
    * @private
    */
    async _onRoll(event) {
        event.preventDefault();
        event.stopPropagation();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const actor = this.actor;

        const rollMgr = new HMRollMgr();
        const chatMgr = new HMChatMgr();
        if (dataset.dialog) {
            const dialogMgr = new HMDialogMgr();
            const dialogResp = await dialogMgr.getDialog(actor, dataset);
            const roll = await rollMgr.getRoll(dataset, dialogResp);
            const card = await chatMgr.getCard(roll, dataset, dialogResp);
            return await ChatMessage.create(card);
        }
    }
}
        /*

            switch (dataset.rollType) {
                case "skill": {
                    const itemid = this._getItemId(event);
                    const item = this._getOwnedItem(itemid);
                    const roll = await new Roll(dataset.roll, item.data.data);
                    await roll.evaluate({async: true});
                    const card = await hChat.genCard(roll, dataset, item.data);
                    return await ChatMessage.create(card);
                }
                case "ability":
                case "save": {
                    const roll = new Roll(dataset.roll, this.actor.data.data)
                    await roll.evaluate({async: true});
                    const card = await hChat.genCard(roll, dataset);
                    return await ChatMessage.create(card);
                }
            }
        }
*/
