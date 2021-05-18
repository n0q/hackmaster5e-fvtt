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

        let hpcurrent = data.hp.max;
        for (let i of this.items) {
            let item = i.data;
            switch(i.type) {
                case "wound": {
                    hpcurrent -= i.data.data.hp.value;
                    break;
                }
            }
        }
        data.hp.value = hpcurrent;
    }
}
