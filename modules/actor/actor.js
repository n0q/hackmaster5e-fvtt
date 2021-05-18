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

        let hp_racial, hp_lost = 0;

        // Setting HP
        // TODO: This could certainly be done more nicely.
        for (let i of this.items) {
            let item = i.data;
            switch(i.type) {
                case "race": {
                    hp_racial = (i.data.data.hp_mod.value || 0);
                    break;
                }
                case "wound": {
                    hp_lost += i.data.data.hp.value;
                    break;
                }
            }
        }

        data.hp.max   = hp_racial + (data.abilities.con.value || 0);
        data.hp.value = data.hp.max - hp_lost;
    }
}
