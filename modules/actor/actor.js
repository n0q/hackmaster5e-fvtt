export class HackmasterActor extends Actor {

    prepareData() {
        super.prepareData();

        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;


        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        if (actorData.type === 'character') this._prepareCharacterData(actorData);
    }

    _prepareCharacterData(actorData) {
        const data = actorData.data;

        const race      = this.items.filter((a) => a.type === "race")[0];
        const racial_hp = race.data.data.hp_mod.value || 0;
        const con_hp    = data.abilities.con.value || 0;
        data.hp.max     = racial_hp + con_hp;

        const wounds    = this.items.filter((a) => a.type === "wound");
        let hp_loss     = 0;
        Object.keys(wounds).forEach( (a) => hp_loss += wounds[a].data.data.hp.value);
        data.hp.value = data.hp.max - hp_loss;
    }
}
