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
        const levelData = {level_hp: 0, top: 0.00};
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
            let top = levelSort[i].data.data.top_mod.value || 0.00;
            let hp_curr = levelSort[i].data.data.hp.value || 0;
            let hp_curr_checked = levelSort[i].data.data.hp.reroll.checked;
            if (hp_curr_checked) {
                hp_curr = Math.max(0, hp_curr - hp_prev);
            }

            levelData.top      += top;
            levelData.level_hp += hp_curr;
            hp_prev = hp_curr;
        }


        // TODO: Yes, of course this whole setup is horseshit.
        // Doing it right can come later. Let's just make it work for now.
        // Yes. That was as scary to type as it was to read.

        // Armor calculations
        const totalArmor = {"dr": {"value": 0}, "def": {"value": 0}, "init": {"value": 0}, "spd": {"value": 0}};
        const armorObj = this.items.filter((a) => a.type === "armor");
        for (let i = 0; i <armorObj.length; i++) {
            const armorData = armorObj[i].data.data;
            const armorDerived = {};
            armorDerived.dr     = {"value": armorData.dr.value    + armorData.dr.mod.value};
            armorDerived.def    = {"value": armorData.def.value   + armorData.def.mod.value};
            armorDerived.init   = {"value": armorData.init.value  + armorData.init.mod.value};
            armorDerived.spd    = {"value": armorData.spd.value   + armorData.spd.mod.value};
            armorDerived.movcf  = {"value": armorData.movcf.value + armorData.movcf.mod.value};
            armorObj[i].data.data.derived = armorDerived;

            totalArmor.dr.value   += armorDerived.dr.value;
            totalArmor.def.value  += armorDerived.def.value;
            totalArmor.init.value += armorDerived.init.value;
            totalArmor.spd.value  += armorDerived.spd.value;
        }

        data.derived.armor = totalArmor;
        // Weapon calculations
        const weaponObj  = this.items.filter((a) => a.type === "weapon");
        for (let i = 0; i < weaponObj.length; i++) {
            const wdata = weaponObj[i].data.data;
            const wProf = wdata.proficiency;
            wdata.armor = totalArmor;
            var profData = {};
            const prof  = this.items.find((a) => {
                return a.type === "proficiency" && a.name === wProf;
            });
            if (prof) {
                profData = deepClone(prof.data.data);
            } else {
                const wSkill   = wdata.skill;
                const profPenalty = {
                    minimal: -1,
                    low:     -2,
                    medium:  -4,
                    high:    -6
                }[wSkill];

                profData.atk = {mod: {value: profPenalty}};
                profData.dmg = {mod: {value: profPenalty}};
                profData.def = {mod: {value: profPenalty}};
                profData.spd = {mod: {value: -profPenalty}};
            }

            wdata.atk.prof = profData.atk.mod;
            wdata.dmg.prof = profData.dmg.mod;
            wdata.def.prof = profData.def.mod;
            wdata.spd.prof = profData.spd.mod;

            wdata.atk.derived = {"value":                   wdata.atk.mod.value + wdata.atk.prof.value};
            wdata.dmg.derived = {"value":                   wdata.dmg.mod.value + wdata.dmg.prof.value};
            wdata.def.derived = {"value":                   wdata.def.mod.value + wdata.def.prof.value + wdata.armor.def.value};
            wdata.spd.derived = {"value": wdata.spd.value + wdata.spd.mod.value + wdata.spd.prof.value + wdata.armor.spd.value};
        }


        // HP Calculations
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


        // Save Calculations
        const savesData = data.saves;

        savesData.dodge.value     = savesData.dodge.mod.value;
        savesData.mental.value    = savesData.dodge.mod.value;
        savesData.physical.value  = savesData.dodge.mod.value;
        savesData.poison.value    = data.derived.abilities.con.value + savesData.poison.mod.value;
        savesData.top.value       = Math.floor(data.derived.abilities.con.value / 2);
        savesData.top.limit.value = Math.ceil((0.3 + levelData.top) * data.hp.max);

        if (dataUpdate.length) { this.updateEmbeddedDocuments("Item", dataUpdate); }

        function sumObjectsByKey(...objs) {
            const res = objs.reduce((a, b) => {
                for (let k in b) {
                    if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k];
                }
                return a;
            }, {});
            return res;
        }

    }
}
