/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class HMItem extends Item {

  /**
   * Augment the basic Item data model with additional dynamic data.
   */

  prepareData() {
      super.prepareData();
      const itemData  = this.data.data;
      const itemType  = this.data.type;
      const actorData = this.actor ? this.actor.data : null;

      if (itemType === "armor")       { this._prepArmorData(itemData, actorData)       } else
      if (itemType === "cclass")      { this._prepCClassData(itemData, actorData)      } else
      if (itemType === "proficiency") { this._prepProficiencyData(itemData, actorData) } else
      if (itemType === "skill")       { this._prepSkillData(itemData, actorData)       }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;

    let roll = new Roll('d20+@abilities.str.mod', actorData);
    let label = `Rolling ${item.name}`;
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label
    });
  }

    // Adjust for mod value.
    _prepArmorData(data, actorData) {
        if (!actorData) return;
        const stats = data.stats;
        for (const key in stats) {
            if (stats.hasOwnProperty(key)) {
                stats[key].derived = {'value': stats[key].value + stats[key].mod.value};
            }
        }
    }

    async _prepCClassData(data, actorData) {
        const pTable = data.ptable;

        // initialize new cclass object ptable
        if (Object.entries(pTable).length === 0) {
            const pData = data._pdata;
            for (let i = 1; i < 21; i++) pTable[i] = deepClone(pData);
            if (Object.entries(pTable).length) return;
            await this.update({'data.ptable': pTable});
        }

        // calculate hp
        if (!actorData) return;
        const level = data.level.value;
        let hp = 0;

        let rerolled = false;
        let hpStack = [];
        let i = 0;
        while (i++ < level) {
            const reroll = pTable[i].hp.reroll.checked;

            // end of a reroll chain
            if (!reroll && rerolled) {
                hp += Math.max(...hpStack);
                rerolled = false;
                hpStack = [];
            }

            // there was no reroll chain
            if (!reroll && !rerolled && hpStack.length === 1) {
                hp += hpStack.pop();
            }

            hpStack.push(parseInt(pTable[i].hp.value) || 0);
            if (reroll) rerolled = true;
        }
        hp += Math.max(...hpStack);

        // grab the level data off the ptable
        const feature = data.features;
        const mod = {hp: {value: hp}};
        for (let i in feature) {
            mod[i] = feature[i].checked
                ? {value: pTable[level][i].value || 0}
                : {value: 0};
        }

        mod.top = {value: (data.top_cf.value || 0.01) * level};
        await this.update({'data.mod': mod});
    }

    // TODO: A user can technically set defense and damage, then
    // set a weapon to ranged. These values should be culled.
    _prepProficiencyData(data, actorData) {
        if (data.mechanical.checked && !data.ranged.checked) {
            return this.update({"data.mechanical.checked": false});
        }
    }

    _prepSkillData(data, actorData) {
        if (!actorData) return;
        if (!data.universal.checked || data.mastery.value > 0) {
            data.mastery.derived = {value: data.mastery.value};
            return;
        }
        const abilities = actorData.data.abilities;
        const relevant  = data.abilities;
        const stack = [];

        // HACK: Need derived abilities to set uskill minimums,
        // but they're usually called after items are done.
        if (abilities.str.derived.value === 0) {
            const actor = this.actor;
            actor.setAbilities(actorData.data);
        }

        for (let key in relevant) {
            if (relevant[key].checked) stack.push(abilities[key].derived.value);
        }
        data.mastery.derived = {'value': Math.min(...stack)};
    }

    onClick(event) {
        const itemType = this.type;
        if (itemType === 'wound') { this.WoundAction(event); }
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const dataset = element.dataset;
        const itemData = this.data.data;

        let timer = itemData.timer;
        let hp = itemData.hp;
        let dirty = false;
        let treated  = itemData.treated;

        if (dataset.action === 'decTimer') timer.value--;
        if (dataset.action === 'decHp' || timer.value < 1) {
            timer.value = --hp.value;
            dirty = true;
        }

        if (hp.value < 0) return this.delete();
        await this.update({'data': {hp, timer, treated}});
        if (dirty && this.parent) {
            this.parent.modifyTokenAttribute('data.hp.value');
        }
    }

    static async createItem(item) {
        if (item.type === 'wound' && item.parent) {
            item.parent.modifyTokenAttribute('data.hp.value');
        }
    }

    static async deleteItem(item) {
        if (item.type === 'wound' && item.parent) {
            item.parent.modifyTokenAttribute('data.hp.value');
        }
    }
}
