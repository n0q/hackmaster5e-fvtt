/* global $ */
import { HMDialogMgr } from '../mgr/dialogmgr.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMRollMgr } from '../mgr/rollmgr.js';
import { idx } from '../sys/localize.js';
import { HMTABLES, MODULE_ID } from '../sys/constants.js';

export class HMActorSheet extends ActorSheet {
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
        this._HMprepareSheet(data);
        return data;
    }

    // TODO: This function is a mess and needs a refactor.
    _prepareBaseItems(sheetData) {
        const actorData = sheetData.actor;
        const uskills = [];
        const skills = [];
        const langs = [];
        const wounds = [];
        const gear = {
            'weapons': [],
            'armors':  [],
            'items':   [],
        };
        const spells = [];
        const armors = {
            'owned':    [],
            'carried':  [],
            'equipped': [],
        };
        const weapons = {
            'owned':    [],
            'carried':  [],
            'equipped': [],
            'innate':   [],
        };

        const DEFAULT_TOKEN = idx.defaultImg.item;
        for (const i of sheetData.items) {
            i.img = i.img || DEFAULT_TOKEN;

            if (i.type === 'skill') {
                if (i.data.language) { langs.push(i); } else {
                    if (actorData.type === 'character') {
                        i.data.universal ? uskills.push(i) : skills.push(i);
                    } else { skills.push(i); }
                }
            } else
            if (i.type === 'armor') {
                gear.armors.push(i);
                const state = HMTABLES.itemstate[(i.data.state)];
                armors[state].push(i);
            } else
            if (i.type === 'weapon') {
                gear.weapons.push(i);
                const state = HMTABLES.itemstate[(i.data.state)];
                weapons[state].push(i);
            } else
            if (i.type === 'wound')  { wounds.push(i);     } else
            if (i.type === 'item')   { gear.items.push(i); } else
            if (i.type === 'spell')  { spells.push(i);     }
        }

        // Sort
        function skillsort(a, b) {
            return `${game.i18n.localize(a.name)} ${a.data.specialty.value || ''}`
                 > `${game.i18n.localize(b.name)} ${b.data.specialty.value || ''}` ? 1 : -1;
        }

        function spellsort(a, b) {
            return Number(a.data.lidx) > Number(b.data.lidx)
                || a.name > b.name ? 1 : -1;
        }

        skills.sort(skillsort);
        langs.sort(skillsort);

        if (actorData.type === 'character') {
            uskills.sort(skillsort);
            actorData.skills = {skills, uskills, langs};
        } else {
            actorData.skills = {skills, langs};
        }

        actorData.wounds = wounds;
        actorData.armors = armors;
        actorData.gear = gear;
        actorData.spells = spells.sort(spellsort);
        actorData.weapons = weapons;

        const slevels = [];
            for (let i=0; i < actorData.spells.length; i++) {
                const lidx = Number(actorData.spells[i].data.lidx);
                if (!slevels.includes(lidx)) { slevels.push(lidx); }
            }

        actorData.slevels = slevels.sort();

        // If sheet has only one spell level, the controls are locked.
        if (slevels.length == 1) {
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
        const { data } = item.data;
        data.state = (++data.state || 0) % 3;
        await this.actor.updateEmbeddedDocuments('Item', [{_id:item.id, data}]);
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
        const {dataset} = element;
        const {actor} = this;

        if (dataset.dialog === 'atk' || dataset.dialog === 'ratk') {
            return game[MODULE_ID].HMWeaponItem.rollAttack({weapon: dataset.itemId, caller: actor});
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
