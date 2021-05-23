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
        const dataUpdate = [];

        // Ability adjustments
        // TODO: Strip mods from 'derived' to avoid confusion.
        const d_abilities = deepClone(data.abilities);
        const actorRace = this.items.find((a) => a.type === "race");
        // TODO: Non-racial mods don't work if there is no race.
        if(actorRace) {
            let modsRace = actorRace.data.data.mods.abilities;
            for (let key in d_abilities) {
                d_abilities[key].value  += modsRace[key].value;
                d_abilities[key].value  += data.abilities[key].mod.value;
                d_abilities[key].fvalue += data.abilities[key].mod.fvalue;
            }
         }
        data.derived = {abilities: d_abilities};


        // Level sorting
        const levelData = {level_hp: 0, level_top: 0.00};
        const levelObj  = this.items.filter((a) => a.type === "character_class");
        const levelSort = levelObj.sort((a, b) => { return a.data_ord - b.data._ord });
        let b_reorder = false;

        let hp_prev = 0;
        for (let i = 0; i < levelSort.length; i++) {
            if (levelSort[i].data.data._ord !== i + 1 || b_reorder) {
                levelSort[i].data.data._ord = i + 1;
                dataUpdate.push({_id:levelSort[i].id, data:levelSort[i].data.data});
                b_reorder = true;
            }

        // Level processing.
            let level_top = levelSort[i].data.data.top_mod.value || 0.00;
            let hp_curr = levelSort[i].data.data.hp.value || 0;
            let hp_curr_checked = levelSort[i].data.data.hp.reroll.checked;
            if (hp_curr_checked) {
                hp_curr = Math.max(0, hp_curr - hp_prev);
            }

            levelData.level_top += level_top;
            levelData.level_hp += hp_curr;
            hp_prev = hp_curr;
        }


        const weaponObj  = this.items.filter((a) => a.type === "weapon");
        for (let i = 0; i < weaponObj.length; i++) {
            const wdata = weaponObj[i].data.data;

            var profData;
            const prof  = this.items.find((a) => {
                return a.type === "proficiency" && a.name === "Longswords";
            });
            if (prof) {
                profData = prof.data.data;
            }

            // TODO: Yes, of course this whole setup is horseshit. Step 1 is getting it on the page.
            wdata.atk.prof    = profData.atk.mod;
            wdata.dmg.prof    = profData.dmg.mod;
            wdata.def.prof    = profData.def.mod;
            wdata.spd.prof    = profData.spd.mod;

            wdata.atk.derived = {"value": wdata.atk.mod.value + wdata.atk.prof.value};
            wdata.dmg.derived = {"value": wdata.dmg.mod.value + wdata.dmg.prof.value};
            wdata.def.derived = {"value": wdata.def.mod.value + wdata.def.prof.value};
            wdata.spd.derived = {"value": wdata.spd.mod.value + wdata.spd.prof.value};
        }


        if (dataUpdate.length) {console.warn("Hi hello");}
        if (dataUpdate.length) { this.updateEmbeddedDocuments("Item", dataUpdate); }



        // TODO: Sloppy.
        const race      = this.items.filter((a) => a.type === "race")[0];
        var racial_hp   = 0;
        if (race) { racial_hp = race.data.data.hp_mod.value || 0 };

        const con_hp    = data.derived.abilities.con.value || 0;
        const level_hp  = levelData.level_hp || 0;
        data.hp.max     = racial_hp + con_hp + level_hp;

        const wounds    = this.items.filter((a) => a.type === "wound");
        let hp_loss     = 0;
        Object.keys(wounds).forEach( (a) => hp_loss += wounds[a].data.data.hp.value);
        data.hp.value = data.hp.max - hp_loss;
    }
}
