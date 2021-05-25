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
        const armors = [];
        const uskills = [];
        const skills = [];
        const gear = [];
        const wounds = [];
        const weapons = [];
        const profs = [];
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
                case "armor":
                    gear.push(i);
                    armors.push(i);
                    break;
                case "character_class":
                    character_classes.push(i);
                    break;
                case "item":
                    gear.push(i);
                    break;
                case "proficiency":
                    profs.push(i);
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
        actorData.armors = armors;
        actorData.gear = gear;
        actorData.skills = skills;
        actorData.uskills = uskills;
        actorData.features = features;
        actorData.spells = spells;
        actorData.wounds = wounds;
        actorData.weapons = weapons;
        actorData.profs = profs;
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
    html.find('.wound').click(this._onEditWound.bind(this));
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.editable').change(this._onEdit.bind(this));

    // ui elements
    html.find('.toggle').click(this._onToggle.bind(this));

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

    // TODO: This should obviously take args.
    // TODO: These should function autonomously between users.
    async _onToggle(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const item    = this._getOwnedItem(this._getItemId(event));
        const toggle = item.getFlag('hackmaster5e', "ui.toggle");
        item.setFlag('hackmaster5e', "ui.toggle", !toggle);
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
        const element = event.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(this._getItemId(event));
        if (dataset.itemProp) {
            const itemProp = dataset.itemProp;
            let targetValue = event.target.value;
            if (dataset.dtype === "Number") { targetValue = parseInt(targetValue); }
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
        const element = event.currentTarget;
        const dataset = element.dataset;

        //TODO: Clean this whole mess up.
        //      Everything here is temporary. If it's still here by 0.2,
        //      <span class="uncle_roger">You fucked up.</span>
        //
        //      Most of these could be generalized. Chat handler should deal with.
        //      card data, as that's what it's there for.
        //
        //      RollHandler should interpret specialized tokens to provide double
        //      roll returns (+/- for skills, save or checks for attributes, etc).
        if (dataset.rollType) {
            switch (dataset.rollType) {
                case "atk": {
                    const itemid  = this._getItemId(event);
                    const item    = this._getOwnedItem(itemid);
                    const roll    = new RollHandler(dataset.roll, item.data.data);
                    await roll.roll();
                    const myhtml  = await roll._roll.render();
                    const title   = this.actor.name + " attacks with " + item.data.name + ".<p>" +
                                    "Speed: " + item.data.data.spd.derived.value;
                    const card    = ChatHandler.ChatDataSetup(myhtml, title);
                    await ChatMessage.create(card);
                    break;
                }
                case "def": {
                    const itemid  = this._getItemId(event);
                    const item    = this._getOwnedItem(itemid);
                    const roll    = new RollHandler(dataset.roll, item.data.data);
                    await roll.roll();
                    const myhtml  = await roll._roll.render();
                    const title   = this.actor.name + " defends with " + item.data.name + ".";
                    const card    = ChatHandler.ChatDataSetup(myhtml, title);
                    await ChatMessage.create(card);
                    break;
                }
                case "dmg": {
                    const itemid  = this._getItemId(event);
                    const item    = this._getOwnedItem(itemid);
                    const roll    = new RollHandler(dataset.roll, item.data.data);
                    await roll.roll();
                    const myhtml  = await roll._roll.render();
                    const title   = this.actor.name + " damages with " + item.data.name + ".";
                    const card    = ChatHandler.ChatDataSetup(myhtml, title);
                    await ChatMessage.create(card);
                    break;
                }
                case "skill": {
                    const itemid  = this._getItemId(event);
                    const item    = this._getOwnedItem(itemid);
                    const roll    = new RollHandler(dataset.roll, item.data.data);
                    await roll.roll();
                    const myhtml  = await roll._roll.render();
                    const card    = ChatHandler.ChatDataSetup(myhtml, item.data.name);
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
