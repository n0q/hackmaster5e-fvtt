/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class HackmasterActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["hackmaster", "sheet", "actor"],
      template: "systems/hackmaster5e/templates/actor/actor-sheet.hbs",
      width: 920,
      height: 730,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const uskills = [];
    const skills = [];
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
        let item = i.data;
        i.img = i.img || DEFAULT_TOKEN;

        switch(i.type) {
            case "item":
                gear.push(i);
                break;
            case "skill":
                if (i.data.universal.checked) {
                    uskills.push(i);
                } else {
                    skills.push(i);
                }
                break;
            case "features":
                features.push(i);
                break;
            case "spell":
                if (i.data.spellLevel != undefined) {
                    spells[i.data.spellLevel].push(i);
                }
                break;
        }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.skills = skills;
    actorData.uskills = uskills;
    actorData.features = features;
    actorData.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

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

    _getItemId(event) {
        let id = $(event.currentTarget).parents(".item").attr("data-item-id");
        if (typeof id === "undefined") {
            id = $(event.currentTarget).attr("data-item-id");
        }
        return id;
    }

    _getOwnedItem(itemId) { return this.actor.items.get(itemId); }

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

   /**
    * Handle clickable rolls.
    * @param {Event} event   The originating click event
    * @private
    */
    async _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        // TODO: This is a god-awful mess, and it ignores the dataset.roll entirely.
        if (dataset.roll) {
            const itemid  = this._getItemId(event);
            const item    = this._getOwnedItem(itemid);
            const mastery = item.data.data.mastery.value;

            let roll      = new Roll("1d100p +" + mastery, this.actor.data.data);
            let label     = dataset.label ? `Rolling ${dataset.label}` : '';
            let rolled    = await roll.evaluate({async: true});
            rolled.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label
            });
        }
    }
}
