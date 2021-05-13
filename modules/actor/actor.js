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

    // Derived (NOT SAVED) data is generated here.
    _prepareCharacterData(actorData) {
        const data = actorData.data;

        // This sample from boilerplate just creates DnD style ability mods.
        for (let [key, ability] of Object.entries(data.abilities)) {
            ability.mod = Math.floor((ability.value - 10) / 2);
        }

        // TODO: We'll put things like Max HP, ToP saves, and so on here.
    }
}
