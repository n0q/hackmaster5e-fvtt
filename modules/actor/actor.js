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

        if (data.hp.value === undefined) {
            data.hp.value = data.hp.max;
        }
    }
}
