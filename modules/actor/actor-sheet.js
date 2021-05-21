import RollHandler from "../sys/roller.js";
import ChatHandler from "../chat/chat.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class HackmasterActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["hackmaster", "sheet", "actor"],
            template: "systems/hackmaster5e/templates/actor/actor-base.hbs",
            width: 820,
            height: 750,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "combat" }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
//      for (let attr of Object.values(data.data.data.attributes)) {
//          attr.isCheckbox = attr.dtype === "Boolean";
//      }

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
    async _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;

        // Initialize containers.
        const uskills = [];
        const skills = [];
        const gear = [];
        const wounds = [];
        const weapons = [];
        const features = [];
        let race = null;
        const character_classes = [];

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
            var _;
            switch(i.type) {
                case "character_class":
                    character_classes.push(i);
                    break;
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
                case "race":

                    // Swap race objects.
                    // TODO: Is this the best place to make this check?
                    if (race) {
                        const oldId = race._id;
                        const oldRace = this.actor.items.get(oldId);
                        await oldRace.delete();
                    }
                    race = i;
                    break;
                case "weapon":
                    gear.push(i);
                    weapons.push(i);
                    break;
                case "wound":
                    wounds.push(i);
                    break;
            }
        }

        // Assign and return
        actorData.gear = gear;
        actorData.skills = skills;
        actorData.uskills = uskills;
        actorData.features = features;
        actorData.spells = spells;
        actorData.wounds = wounds;
        actorData.weapons = weapons;
        actorData.race = race;
        actorData.character_classes = character_classes.sort((a, b) => { return a.data._ord - b.data._ord });

        if (actorData.character_classes) {
            const cclength = actorData.character_classes.length;
            actorData.curr_class = actorData.character_classes[cclength -1];
        }
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

    html.find('.editable').click(this._onEdit.bind(this));

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

   async _onEdit(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(this._getItemId(event));

        if (dataset.itemProp) {
            const itemProp = dataset.itemProp;
            const oldValue = getProperty(item.data, itemProp);

            setProperty(item.data, itemProp, oldValue -1);

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
        const element = event.currentTarget;
        const dataset = element.dataset;

        //TODO: Clean this whole mess up.
        //      Everything here is temporary. If it's still here by 0.2,
        //      <span class="uncle roger">You fucked up.</span>
        if (dataset.rollType) {
            switch (dataset.rollType) {
                case "skill": {
                    const itemid  = this._getItemId(event);
                    const item    = this._getOwnedItem(itemid);
                    const mastery = item.data.data.mastery.value;
                    const roll    = new RollHandler("1d100p - " + mastery);
                    await roll.roll();
                    var myhtml    = await roll._roll.render();
                    var card      = ChatHandler.ChatDataSetup(myhtml, item.data.name);
                    await ChatMessage.create(card);
                    break;
                }
                case "ability": {
                    const sKey = $(event.currentTarget).attr('for');
                    const ability = getProperty(this.actor, sKey);

                    const complete_mess = sKey.split('.').slice(4,5)[0];
                    const gah           = game.i18n.localize("HM.ability." + complete_mess);
                    const roll    = new RollHandler("1d20p + " + ability);
                    await roll.roll();
                    var myhtml    = await roll._roll.render();
                    var card      = ChatHandler.ChatDataSetup(myhtml, gah);
                    await ChatMessage.create(card);
                    break;
                }
            }
        }
    }


}
