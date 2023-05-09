import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMContainer } from '../item/container.js';
import { HMCONST, HMTABLES, SYSTEM_ID } from '../tables/constants.js';

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
        const {actor} = sheetData;
        const {spell} = actor.itemTypes;
        const gear = {weapons: [], armors: [], items: []};
        const armors = {owned: [], carried: [], equipped: []};
        const weapons = {owned: [], carried: [], equipped: [], innate: []};
        const skills = {uskills: [], oskills: [], iskills: []};

        const containers = HMContainer.getContainers(actor);
        const containerMap = containers.map((a) => [a._id, a.name]);
        actor.containers = Object.fromEntries([[null, '']].concat(containerMap));

        actor.itemTypes.skill.forEach((i) => {
            if (i.system.language) {
                skills.iskills.push(i);
                return;
            }

            if (actor.type !== 'character' || !i.system.universal) {
                skills.oskills.push(i);
                return;
            }

            skills.uskills.push(i);
        });

        actor.itemTypes.armor.forEach((i) => {
            gear.armors.push(i);
            const state = HMTABLES.itemstate[(i.system.state)];
            armors[state].push(i);
        });

        actor.itemTypes.weapon.forEach((i) => {
            gear.weapons.push(i);

            const {INNATE} = HMCONST.ITEM_STATE;
            const {innate, state} = i.system;
            if (state !== INNATE && innate) {
                // Stopgap until inventory overhaul.
                i.update({'system.state': INNATE});
                weapons[HMTABLES.itemstate[INNATE]].push(i);
            } else {
                const itemState = HMTABLES.itemstate[(i.system.state)];
                weapons[itemState].push(i);
            }
        });

        gear.items = actor.itemTypes.item.sort((a, b) => a.name.localeCompare(b.name));

        function skillsort(a, b) {
            return `${game.i18n.localize(a.name)} ${a.system.specialty.value || ''}`
                 > `${game.i18n.localize(b.name)} ${b.system.specialty.value || ''}` ? 1 : -1;
        }

        Object.keys(skills).forEach((skillType) => skills[skillType].sort(skillsort));

        actor.skills = skills;
        actor.armors = armors;
        actor.weapons = weapons;
        actor.gear = gear;
        actor.spells = spell.sort(
            (a, b) => Number(a.system.lidx) - Number(b.system.lidx) || a.name.localeCompare(b.name),
        );

        actor.talents = actor.itemTypes.talent.sort((a, b) => a.name.localeCompare(b.name));

        const slevels = [];
            for (let i=0; i < actor.spells.length; i++) {
                const lidx = Number(actor.spells[i].system.lidx);
                if (!slevels.includes(lidx)) { slevels.push(lidx); }
            }

        actor.slevels = slevels.sort();
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
        html.find('.item-edit').click((ev) => {
            const li = $(ev.currentTarget).parents('.card, .item');
            const itemId = li.data('itemId');
            const item = this.actor.items.get(itemId);

            if (item) {
                item.sheet.render(true);
            } else {
                // Maybe the item is in a container.
                const containerId = li.data('containerId');
                let container = this.actor.items.get(containerId);
                if (!container) {
                    // We have to go deeper.
                    const rootId = li.data('rootId');
                    console.warn('hello');
                    container = HMContainer.getChildContainer(rootId, containerId, this.actor);
                }
                const {hmContents} = container;
                const child = hmContents.find((a) => a._id === itemId);
                child.sheet.render(true);
            }
        });

        // Delete Item
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.card, .item');
            const itemId = li.data('itemId');
            let item = this.actor.items.get(itemId);
            if (!item) {
                const containerId = li.data('containerId');
                let container = this.actor.items.get(containerId);
                if (!container) {
                    const rootId = li.data('rootId');
                    container = HMContainer.getChildContainer(rootId, containerId, this.actor);
                }
                const {hmContents} = container;
                item = hmContents.find((a) => a._id === itemId);
            }

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
            const handler = (ev) => this._onDragStart(ev);
            html.find('li.item').each((_i, li) => {
                if (li.classList.contains('inventory-header')) return;
                li.setAttribute('draggable', true);
                li.addEventListener('dragstart', handler, false);
            });
        }
    }

    // Getters
    _getOwnedItem(itemId) {
        const {actor} = this;
        return actor.items.get(itemId)
            ?? actor.effects.get(itemId)
            ?? actor.wprofiles.get(itemId);
    }

    async _onItemCreate(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        const {type} = dataset;
        const itemName = `New ${type.capitalize()}`;

        const itemData = {name: itemName, type};
        if (dataset.dialog) {
            const dialogResp = await HMDialogFactory(dataset, this.actor);
            itemData.data = dialogResp.data;
        }

        const newItem = await Item.create(itemData, {parent: this.actor});
        if (dataset.render === 'true') newItem.sheet.render(true);
    }

    _updateOwnedItem(item) {
        return this.actor.updateEmbeddedDocuments('Item', item.data);
    }

    async _onToggle(ev) {
        ev.preventDefault();
        const cId = getItemId(ev, 'data-toggle-id') ?? getItemId(ev);

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
        const item = this._getOwnedItem(getItemId(ev));
        item.onClick(ev);
        const {dataset} = ev.currentTarget;
        if (dataset.toggle) {
            const id = getItemId(ev);
            const {visibleItemId} = this;
            visibleItemId[id] = !visibleItemId[id];
        }
    }

    async _onSelect(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const {dataset, value} = ev.currentTarget;
        const {flag} = dataset;
        if (flag) this.actor.setFlag(SYSTEM_ID, flag, value);
    }

    async _onEdit(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const dataset = element.dataset;
        const item    = this._getOwnedItem(getItemId(ev));

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
           await this.actor.updateEmbeddedDocuments('Item', [{_id:item.id, data:item.system}]);
        }
    }

    async _onRoll(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const {dataset} = element;
        const {dialog} = dataset;
        const {actor} = this;

        if (dialog === 'atk') {
            return game[SYSTEM_ID].HMWeaponItem.rollAttack({weapon: dataset.itemId, caller: actor});
        }

        if (dialog === 'dmg') {
            return game[SYSTEM_ID].HMWeaponItem.rollDamage({weapon: dataset.itemId, caller: actor});
        }

        if (dialog === 'def') {
            return game[SYSTEM_ID].HMWeaponItem.rollDefend({weapon: dataset.itemId, caller: actor});
        }

        if (dialog === 'skill') {
            return game[SYSTEM_ID].HMItem.rollSkill({itemId: dataset.itemId, caller: actor});
        }

        if (dialog === 'cast') {
            return game[SYSTEM_ID].HMSpellItem.rollSpell({spell: dataset.itemId, caller: actor});
        }

        if (dialog) {
            const dialogResp = await HMDialogFactory(dataset, actor);
            const cData = {dataset, dialogResp};

            let {formula} = dataset;
            const {formulaType} = dataset;
            if (formulaType) formula = HMTABLES.formula[dialog][formulaType];
            const {context, resp} = dialogResp;
            const {hackmaster5e, system} = context;
            const rollContext = {...system, resp, talent: hackmaster5e.talent};
            if (formula) cData.roll = await new Roll(formula, rollContext).evaluate({async: true});

            const chatMgr = new HMChatMgr();
            const card = await chatMgr.getCard(cData);
            return ChatMessage.create(card);
        }

        return false;
    }
}

function getItemId(ev, attr='data-item-id') {
    const el = ev.currentTarget;
    return $(el).attr(attr) || $(el).parents('.card, .item').attr(attr);
}
