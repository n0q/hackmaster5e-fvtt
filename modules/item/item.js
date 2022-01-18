import { HMTABLES } from '../sys/constants.js';

export class HMItem extends Item {
  prepareDerivedData() {
      super.prepareDerivedData();
      const itemData  = this.data.data;
      const itemType  = this.data.type;
      const actorData = this.actor ? this.actor.data : null;

      // HACK: Need derived abilities/bonuses, which are usually called after items are done.
      if (actorData && !actorData.data.abilities.total) {
          const actor = this.actor;
          actor.setRace(actorData.data);
          actor.setAbilities(actorData.data);
          actor.setAbilityBonuses(actorData.data);
          actor.setBonusTotal(actorData.data);
      }

      if (itemType === "armor")       { this._prepArmorData(itemData, actorData)       } else
      if (itemType === "cclass")      { this._prepCClassData(itemData, actorData)      } else
      if (itemType === "proficiency") { this._prepProficiencyData(itemData, actorData) } else
      if (itemType === "skill")       { this._prepSkillData(itemData, actorData)       } else
      if (itemType === "weapon")      { this._prepWeaponData(itemData, actorData)      }
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

    _prepArmorData(itemData, actorData) {
        if (!actorData) return;
        const bonus = itemData.bonus;

        for (let key in bonus.total) {
            let sum = -bonus.total[key];
            for (let state in bonus) { sum += bonus[state][key]; }
            bonus.total[key] = sum;
        }
        itemData.processed = true;
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
        const abilities = actorData.data.abilities.total;
        const relevant  = data.abilities;
        const stack = [];

        for (let key in relevant) {
            if (relevant[key].checked) stack.push(abilities[key].value);
        }
        data.mastery.derived = {'value': Math.min(...stack)};
    }

    _prepWeaponData(itemData, actorData) {
        if (!actorData) return;

        const armors   = [];
        const shields  = [];
        const armor    = {};
        const shield   = {};
        const defItems = actorData.items.filter((a) => a.type === 'armor' &&
                                                       a.data.data.state.equipped.checked);

        // Splitting armor and shields for now, so we can manage stances later.
        for (let i = 0; i < defItems.length; i++) {
            const defItem = defItems[i];
            const defData = defItem.data.data;
            if (!defData.processed) { defItem._prepArmorData(defData, actorData); }
            defData.shield.checked ? shields.push(defItem) : armors.push(defItem);
        }

        const bonus     = itemData.bonus;

        const stats     = {};
        const bonusData = actorData.data.bonus.total;

        const spec      = {};
        const profTable = HMTABLES.weapons.noprof;
        const wSkill    = itemData.skill;
        const profItem  = actorData.items.find((a) => {
            return a.type === "proficiency" && a.name === itemData.proficiency;
        });

        const cclass     = {};
        const cclassItem = actorData.items.find((a) => a.type === "cclass");
        const cData      = cclassItem ? cclassItem.data.data.mod : null;

        const race       = {};
        const raceItem   = actorData.items.find((a) => a.type === 'race');

        let j = 0;
        for (let key in bonus.total) {
            const profBonus = profItem ? profItem.data.data[key].value
                                       : profTable.table[wSkill] * profTable.vector[j++];
            spec[key]   = profBonus || 0;
            cclass[key] = cData?.[key]?.value || 0;
            race[key]   = raceItem ? raceItem.data.data?.[key]?.value || 0 : 0;
            stats[key]  = bonusData[key] || 0;

            // Explicitly allowing multiple armor/shields because we don't support accesories yet.
            for (let i = 0; i < armors.length; i++)  {
                const armorData = armors[i].data.data.bonus.total;
                armor[key] = (armor[key] || 0) + (armorData[key] || 0);
            }
            for (let i = 0; i < shields.length; i++)  {
                const shieldData = shields[i].data.data.bonus.total;
                shield[key] = (shield[key] || 0) + (shieldData[key] || 0);
            }
        }
        if (!Object.values(stats).every( a => a === 0)) { bonus.stats = stats; }
        if (!Object.values(spec).every( a => a === 0)) { bonus.spec = spec; }
        if (!Object.values(cclass).every( a => a === 0)) { bonus.class = cclass; }
        if (!Object.values(race).every( a => a === 0)) { bonus.race = race; }
        if (!Object.values(armor).every( a => a === 0)) { bonus.armor = armor; }
        if (!Object.values(shield).every( a => a === 0)) { bonus.shield = shield; }

        for (let key in bonus.total) {
            let sum = -bonus.total[key];
            for (let state in bonus) { sum += bonus[state][key]; }
            bonus.total[key] = sum;
        }
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
