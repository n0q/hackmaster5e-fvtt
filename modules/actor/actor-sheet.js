import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMChatMgr } from '../mgr/chatmgr.js';
import { HMContainer } from '../item/container.js';
import { HMCONST, HMTABLES, SYSTEM_ID } from '../tables/constants.js';
import { HMChatFactory, CHAT_TYPE } from '../chat/chat-factory.js';
import { HMWoundItem } from '../item/wound-item.js';
import { applyCustomActiveEffect } from '../sys/effects.js';
import { idx } from '../tables/dictionary.js';

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
        this.#prepareEffects(data);
        this._HMprepareSheet(data);
        return data;
    }

    /**
     * Preps and processes active effects. Necessary for custom effect handling.
     * Custom effect values are stored in displayValue.
     *
     * @private
     * @param {Object} data - sheet data from getData()
     * @param {HMActor} data.actor - Actor who's effects are being processed.
     *
     * @returns {void}
     */
    #prepareEffects(data) {
        this.actor.processedEffects = [...data.actor.allApplicableEffects()].map((effect) => {
            const type = effect.effectType;
            const processedChanges = effect.changes.map((change) => {
                if (change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM) {
                    const [cfx, ...prop] = change.value.split(',');
                    const displayValue = applyCustomActiveEffect(cfx, this.actor, prop);
                    return { ...change, displayValue };
                }
                return change;
            });
            return { ...effect, changes: processedChanges, type, id: effect.id };
        });
    }

    _prepareBaseItems(sheetData) {
        const {actor} = sheetData;
        const {spell} = actor.itemTypes;
        const gear = {weapons: [], armors: [], items: []};
        const armors = {owned: [], carried: [], equipped: []};
        const weapons = {owned: [], carried: [], equipped: [], innate: []};
        const skills = {uskills: [], oskills: [], iskills: []};

        const containers = HMContainer.getContainers(actor);
        const containerList = containers.map((a) => [a._id, a.name]);
        actor.containers = Object.fromEntries([[null, '']].concat(containerList));
        actor.containerMap = HMContainer.getMap(actor.itemTypes.item);

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

        gear.items = actor.itemTypes.item.sort((a, b) => {
            const container = a.system.container.enabled - b.system.container.enabled;
            return container || a.name.localeCompare(b.name);
        });

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

        const {spellLevels} = idx;
        const minLevel = actor.spells[0]?.system?.lidx;
        const maxLevel = Math.max(...spell.map((s) => s.system.lidx));

        const spellLevelArray = Object.entries(spellLevels).filter(
            ([k]) => Math.clamp(k, minLevel, maxLevel) === Number(k),
        );

        actor.slevels = Object.fromEntries(spellLevelArray);
        actor.talents = actor.itemTypes.talent.sort((a, b) => a.name.localeCompare(b.name));
        actor.money = this.money();
    }

    money() {
        const {ITEM_STATE} = HMCONST;
        const config = HMTABLES.currency;
        const moneyRaw = this.actor.hm.itemTypes.currency.reduce((acc, c) => {
            acc.total += c.value || 0;
            if (!c.rootId && c.system.state === ITEM_STATE.OWNED) return acc;
            const root = this.actor.items.get(c.rootId);
            if (c.rootId && root.system.state === ITEM_STATE.OWNED) return acc;
            acc.carried += c.value || 0;
            return acc;
        }, {total: 0, carried: 0});

        const {standard} = config;
        const standardValue = config.coins[standard].value;
        const precision = standardValue.toString().length;
        return {
            standard,
            total: parseFloat((moneyRaw.total / standardValue).toFixed(precision)),
            carried: parseFloat((moneyRaw.carried / standardValue).toFixed(precision)),
        };
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
            const rootId = li.data('rootId');

            const item = this.actor.items.get(itemId)
                ?? HMContainer.find(this.actor, itemId, rootId);
            item.sheet.render(true);
        });

        // Delete Item
        html.find('.item-delete').click((ev) => {
            const li = $(ev.currentTarget).parents('.card, .item');
            const itemId = li.data('itemId');
            const rootId = li.data('rootId');
            const item = this.actor.items.get(itemId)
                ?? HMContainer.find(this.actor, itemId, rootId);

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

        // Drag events.
        if (this.actor.isOwner) {
            const handler = (ev) => {
                try {
                    this._onDragStart(ev);
                } catch (error) {
                    if (!(error instanceof TypeError)) throw error;
                    HMContainer.dragStartHandler(ev, this.actor);
                }
            };

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
        return actor.hm.items.get(itemId)
            ?? actor.effects.get(itemId)
            ?? actor.wprofiles.get(itemId);
    }

    async _onItemCreate(ev) {
        ev.preventDefault();
        const {dataset} = ev.currentTarget;
        const {type} = dataset;
        const itemName = `New ${type.capitalize()}`;
        const itemData = {name: itemName, type};

        const {dialog} = dataset;
        if (dialog === 'wound') { await HMWoundItem.addWound(true, this.actor); } else
        if (dialog) {
            const dialogResp = await HMDialogFactory(dataset, this.actor);
            itemData.data = dialogResp.data;
        } else {
            const newItem = await Item.create(itemData, {parent: this.actor});
            if (dataset.render === 'true') newItem.sheet.render(true);
        }
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
        const {flag, oper} = dataset;
        if (flag) this.actor.setFlag(SYSTEM_ID, flag, value);
        if (oper) HMContainer.moveToContainer(this.actor, ev.currentTarget);
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
            if (dtype === 'Number')  { targetValue = parseInt(targetValue, 10) || 0;              } else
            if (dtype === 'uint')    { targetValue = Math.max(parseInt(targetValue, 10), 0) || 0; } else
            if (dtype === 'Float')   { targetValue = parseFloat(targetValue) || 0;                } else
            if (dtype === 'Percent') {
                const pctMatch = targetValue.match(/^([0-9]+)%$/);
                const floatMatch = targetValue.match(/^([0-9]?\.[0-9]+)$/);
                if (pctMatch)   { targetValue = parseFloat(pctMatch[1]) / 100;   } else
                if (floatMatch) { targetValue = parseFloat(floatMatch[1]);       } else
                                { targetValue = parseInt(targetValue, 10) / 100; } // eslint-disable-line
            }
            await item.update({[itemProp]: targetValue});
        }
    }

    async _onRoll(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const element = ev.currentTarget;
        const {dataset} = element;
        const {dialog, formulaType} = dataset;
        const {actor} = this;

        let cardType = false;

        if (dialog === 'save') return actor.rollSave(dataset);
        if (dialog === 'ability') cardType = CHAT_TYPE.ABILITY_CHECK;

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
            if (formulaType) formula = HMTABLES.formula[dialog][formulaType];
            const {context, resp} = dialogResp;
            const {hackmaster5e, system} = context;
            const rollContext = {...system, resp, talent: hackmaster5e.talent};
            if (formula) cData.roll = await new Roll(formula, rollContext).evaluate();

            if (cardType) {
                const bData = {
                    ...cData.dialogResp,
                    mdata: cData.dataset,
                    roll: cData.roll,
                };
                const builder = new HMChatFactory(cardType, bData);
                return builder.createChatMessage();
            }

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
