import HMDialogMgr from '../mgr/dialogmgr.js';
import HMChatMgr from '../mgr/chatmgr.js';
import HMRollMgr from '../mgr/rollmgr.js';

function updateSflags(item, sflags) {
    const flag = sflags;
    if (item.data.state.equipped) { flag.equipped = true;   } else
    if (item.data.state.carried)  { flag.unequipped = true; }
}

export class HMActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['hackmaster', 'sheet', 'actor'],
            width: 820,
            height: 970,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }]
        });
    }

    /** @override */
    get template() {
        const path = 'systems/hackmaster5e/templates/actor';
        return `${path}/${this.actor.data.type}-base.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ['String', 'Number', 'Boolean'];

        this._prepareBaseItems(data);

        if (this.actor.data.type === 'character') {
            this._prepareCharacterItems(data);
            this._prepareCharacterSheet(data);
            return data;
        }

        this._prepareBeastSheet(data);
        return data;
    }

    _prepareBaseItems(sheetData) {
        const actorData = sheetData.actor;
        const uskills = [];
        const skills = [];
        const langs = [];
        const wounds = [];
        const armors = [];
        const gear = [];
        const spells = [];
        const weapons = [];

        const sflags = {
            'combat': {
                'weapon': {'equipped': false, 'unequipped': false},
                'armor':  {'equipped': false, 'unequipped': false},
            },
        };

        for (const i of sheetData.items) {
            i.img = i.img || DEFAULT_TOKEN;

            if (i.type === 'skill') {
                if (i.data.language) { langs.push(i); } else {
                    i.data.universal ? uskills.push(i) : skills.push(i);
                }
            } else
            if (i.type === 'armor') {
                updateSflags(i, sflags.combat.armor);
                gear.push(i);
                armors.push(i);
            } else
            if (i.type === 'weapon') {
                updateSflags(i, sflags.combat.weapon);
                gear.push(i);
                weapons.push(i);
            } else
            if (i.type === 'wound')  { wounds.push(i); } else
            if (i.type === 'item')   { gear.push(i);   } else
            if (i.type === 'spell')  { spells.push(i); }
        }

        // Sort
        function skillsort(a, b) {
            return a.name + (a.data.specialty.value || '') > b.name + (b.data.specialty.value || '') ? 1 : -1;
        }

        skills.sort(skillsort);
        uskills.sort(skillsort);
        langs.sort(skillsort);

        actorData.skills = {skills, uskills, langs};
        actorData.wounds = wounds;
        actorData.armors = armors;
        actorData.gear = gear;
        actorData.spells = spells;
        actorData.weapons = weapons;
        actorData.sflags = sflags;

        const slevels = [];
            for (let i=0; i < actorData.spells.length; i++) {
                const lidx = Number(actorData.spells[i].data.lidx);
                if (!slevels.includes(lidx)) { slevels.push(lidx); }
            }

        actorData.slevels = slevels.sort();

        // HACK: If sheet has only one spell level, the controls are locked.
        const cslevel = Number(actorData.data.data.cslevel);
        if (slevels.length && !slevels.includes(cslevel)) {
            actorData.data.data.cslevel = actorData.slevels[0];
        }
    }

    async _prepareCharacterItems(sheetData) {
        const actorData = sheetData.actor;

        // Initialize containers.
        const profs = [];
        let race = null;
        let cclass = null;

        // Iterate through items, allocating to containers
        for (const i of sheetData.items) {
            i.img = i.img || DEFAULT_TOKEN;
            if (i.type === 'cclass')      { cclass = i;    } else
            if (i.type === 'proficiency') { profs.push(i); } else
            if (i.type === 'race')        { race = i;      }
        }

        // Assign
        actorData.cclass = cclass;
        actorData.profs = profs;
        actorData.race = race;
    }

    _prepareCharacterSheet(sheetData) {
        const actorData = sheetData.actor;

        // Saves
        const left = ['fos', 'foa', 'turning', 'morale'];
        const right = ['physical', 'mental', 'dodge', 'poison', 'trauma'];
        actorData.saves = {left, right};
    }

    _prepareBeastSheet(sheetData) {
        const actorData = sheetData.actor;

        // Saves
        const left = ['fos', 'foa', 'tenacity', 'will'];
        const right = ['physical', 'mental', 'dodge', 'poison', 'trauma'];
        actorData.saves = {left, right};
    }
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
        const li = $(ev.currentTarget).parents('.card');
        const item = this.actor.items.get(li.data('itemId'));
        const { state } = item.data.data;

        // TODO: This can't possibly stay like this.
        if (state.equipped) { state.equipped = false; } else
        if (state.carried)  { state.carried  = false; } else {
            state.equipped = true;
            state.carried  = true;
        }
        await this.actor.updateEmbeddedDocuments('Item', [{_id:item.id, data:item.data.data}]);
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
