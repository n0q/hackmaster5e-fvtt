/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class HackmasterItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
      super.prepareData();

      const itemData  = this.data.data;
      const itemType  = this.data.type;
      const actorData = this.actor ? this.actor.data : null;

      if (itemType === "armor")  { this._prepArmorData(itemData, actorData)  } else
      if (itemType === "cclass") { this._prepCClassData(itemData, actorData) } else
      if (itemType === "skill")  { this._prepSkillData(itemData, actorData)  } else
      if (itemType === "weapon") { this._prepWeaponData(itemData, actorData) }
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
                stats[key].derived = {"value": stats[key].value + stats[key].mod.value};
            }
        }
    }

    async _prepCClassData(data, actorData) {
        const pTable = data.ptable;

        // ptable initialize
        if (Object.entries(pTable).length === 0) {
            const pData = data._pdata;
            for (let i = 1; i < 21; i++) pTable[i] = deepClone(pData);
            if (Object.entries(pTable).length) return;
            await this.update({"data.ptable": pTable});
        }

        // ptable sums
        if (!actorData) return;
    }

    // Applying stat bonuses to weapons (rather than armor)
    // because you roll weapons, but only view armor.
    _prepWeaponData(data, actorData) {
        if (!actorData) return;
        const bonus = actorData.data.stats;
        const stats = data.stats;
        // TODO: Refactor
        for (const key in stats) {
            if (stats.hasOwnProperty(key)) {
                let statbonus = bonus[key]
                    ? Object.values(bonus[key]).reduce((a,b) => a.value + b.value)
                    : 0;
                if (statbonus.hasOwnProperty('value')) statbonus = statbonus.value;
                stats[key].derived = {"value": stats[key].value + stats[key].mod.value + statbonus};
            }
        }
    }

    _prepSkillData(data, actorData) {
        if (!actorData) return;
        if (!data.universal.checked) return;
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
        data.mastery.derived = {"value": Math.min(...stack)};
    }
}
