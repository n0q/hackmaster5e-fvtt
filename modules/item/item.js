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

      if (itemType === "armor")  { this._prepArmorData(itemData, actorData);  } else
      if (itemType === "skill")  { this._prepSkillData(itemData, actorData);  } else
      if (itemType === "weapon") { this._prepWeaponData(itemData, actorData); }
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

    _prepWeaponData(data, actorData) {
        if (!actorData) return;
        const stats = data.stats;
        for (const key in stats) {
            if (stats.hasOwnProperty(key)) {
                stats[key].derived = {"value": stats[key].value + stats[key].mod.value};
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
            actor.setAbilities(actorData.data, actor);
        }

        for (let key in relevant) {
            if (relevant[key].checked) stack.push(abilities[key].derived.value);
        }
        data.mastery.derived = {"value": Math.min(...stack)};
    }
}
