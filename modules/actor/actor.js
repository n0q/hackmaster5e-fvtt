import { HMTABLES } from '../sys/constants.js';

export class HackmasterActor extends Actor {

    prepareData() {
        super.prepareData();
        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;

        if (actorData.type === 'character') this._prepareCharacterData(data);
    }

    setAbilities(data) {
        const abilities = data.abilities;
        const actorRace = this.items.find((a) => a.type === "race");
        for (let i in abilities) {
            const stat = abilities[i];
            let race = {"value": 0, "fvalue": 0};
            if (actorRace) {
                race.value  = actorRace.data.data.abilities[i].value;
                race.fvalue = actorRace.data.data.abilities[i].fvalue;
            }
            stat.derived.value  = stat.raw.value  + stat.mod.value  + race.value;
            stat.derived.fvalue = stat.raw.fvalue + stat.mod.fvalue + race.fvalue;
        }
    }

    setArmor(data) {
        const armors = this.items.filter((a) => a.type === "armor");
        const armorDerived = data.derived.armor;
        for (const key in armorDerived) {
            armorDerived[key].value = 0;
            for (let i = 0; i <armors.length; i++) {
                armorDerived[key].value += armors[i].data.data.stats[key].derived.value;
            }
        }
        return armorDerived;
    }

    setWeapons(armorDerived) {
        const weapons = this.items.filter((a) => a.type === "weapon");
        const noprof = HMTABLES.weapons.noprof;

        for (let i = 0; i < weapons.length; i++) {
            const data   = weapons[i].data.data;
            const stats  = data.stats;
            const wSkill = data.skill;
            const wProf  = data.proficiency;

            const prof = this.items.find((a) => {
                return a.type === "proficiency" && a.name === wProf;
            });

            let j = 0;
            for (const key in stats) {
                let profValue = 0;
                let armorValue = 0;
                if (armorDerived[key]) armorValue = armorDerived[key].value;
                prof ? profValue = prof.data.data[key].value
                     : profValue = noprof.table[wSkill] * noprof.vector[j++];
                stats[key].prof  = {"value": profValue};
                stats[key].armor = {"value": armorValue};
                stats[key].derived.value += stats[key].prof.value + stats[key].armor.value;
            }
        }
    }

    _prepareCharacterData(data) {
        const dataUpdate = [];

        this.setAbilities(data);

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
            if (hp_curr_checked) hp_curr = Math.max(0, hp_curr - hp_prev);

            levelData.top      += top;
            levelData.level_hp += hp_curr;
            hp_prev = hp_curr;
        }
        if (dataUpdate.length) this.updateEmbeddedDocuments("Item", dataUpdate);

        const armorDerived = this.setArmor(data);
        this.setWeapons(armorDerived);

/*
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
*/
    }
}
