import { HMTABLES } from '../sys/constants.js';

export class HMActor extends Actor {

    prepareData() {
        super.prepareData();
        const actorData = this.data;
        const data = actorData.data;

        if (actorData.type === 'character') this._prepareCharacterData(data);
    }

    async setRace(data) {
        const races = this.items.filter((a) => a.type === "race");
        if (!races.length) return;
        races.pop();

        if (races.length) {
            let oldrace;
            while (oldrace = races.pop()) await oldrace.delete();
        }
    }

    async setCClass(data) {
        const cclasses = this.items.filter((a) => a.type === "cclass");
        if (!cclasses.length) return;

        const cclass = cclasses.pop();
        data.level.value = cclass.data.data.level.value;

        if (cclasses.length) {
            let oldclass;
            while (oldclass = cclasses.pop()) await oldclass.delete();
        }
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

    setEncumbrance(data) {
        let encumb = 0.0;
        const item = this.items.filter((a) => {
            const aData = a.data.data;
            // Proof positive that armor needs a refactor.
            if (aData.state) {
                if (a.type             === 'armor'
                    && aData.armortype !== 'shield'
                    && aData.state.equipped.checked
                ) return false;
                return aData.state.carried.checked;
            }
        });

        for (let i=0; i < item.length; i++) {
            encumb += item[i].data.data.weight.value;
        }
        data.encumb.value = encumb;
    }

    setArmor(data) {
        const armors = this.items.filter((a) => a.type === "armor");
        const armorDerived = data.derived.armor;
        // Remember, we're not zeroing out armorDerived.
        // If we start saving actordata, armorDerived will break.
        for (let i = 0; i <armors.length; i++) {
            const armorData = armors[i].data.data;
            if (   !armorData.state.equipped.checked
                && !armorData.innate.checked) continue;

            for (const key in armorDerived) {
                if (armorData.shield.checked && key === 'dr') {
                   armorDerived[key].shield.value += armorData.stats[key].derived.value;
                   continue;
                }
                armorDerived[key].value += armorData.stats[key].derived.value;
            }
        }
        return armorDerived;
    }

    // TODO: Refactor.
    // A lot of the jank here has to do with inefficiently prepping a weapon for use,
    // while not prepping it for sheet display at all.
    setWeapons(armorDerived) {
        const weapons = this.items.filter((a) => a.type === "weapon");
        const noprof = HMTABLES.weapons.noprof;

        for (let i = 0; i < weapons.length; i++) {
            const data   = weapons[i].data.data;
            const stats  = data.stats;
            const wSkill = data.skill;
            const wProf  = data.proficiency;
            const sData  = this.data.data.stats;

            const cclass = this.items.find((a) => a.type === 'cclass');
            const cData = cclass ? cclass.data.data.mod : null;

            const prof = this.items.find((a) => {
                return a.type === "proficiency" && a.name === wProf;
            });

            let j = 0;
            for (const key in stats) {
                let profValue = 0;
                let armorValue = 0;
                let classValue = 0;
                let statValue = 0;
                if (armorDerived[key]) armorValue = armorDerived[key].value;
                prof ? profValue = prof.data.data[key].value
                     : profValue = noprof.table[wSkill] * noprof.vector[j++];
                stats[key].prof  = {"value": profValue};
                stats[key].armor = {"value": armorValue};

                if (cclass) {
                    classValue = cData?.[key]?.value || 0;
                }
                stats[key].cclass = {"value": classValue};

                statValue = sData[key]
                    ? parseInt(Object.values(sData[key]).reduce((a,b) => a.value + b.value))
                    : 0;
                if (statValue != statValue) statValue = sData[key]["str"].value;
                stats[key].stats = {'value': statValue};
                stats[key].derived.value += stats[key].prof.value
                                         +  stats[key].armor.value
                                         +  stats[key].cclass.value;
            }
        }
    }

    setCharacterMaxHP(data) {
        const race      = this.items.find((a) => a.type === "race");
        const racial_hp = race ? race.data.data.hp.value : 0;
        const con_hp    = data.abilities.con.derived.value || 0;
        const cclass    = this.items.find((a) => a.type === "cclass");
        const level_hp  = cclass ? cclass.data.data.mod.hp.value : 0;
        data.hp.max     = racial_hp + con_hp + level_hp;
    }

    setCurrentHP(data) {
        const wounds = this.items.filter((a) => a.type === "wound");
        let hp_loss = 0;
        Object.keys(wounds).forEach( (a) => hp_loss += wounds[a].data.data.hp.value);
        data.hp.value = data.hp.max - hp_loss;
    }

    setSaves(data) {
        // TODO: Refactor
        // actor.js is probably the wrong place to do this. Also SPoT should be constants.js.
        const cclass    = this.items.find((a) => a.type === "cclass");
        const leveltop  = cclass ? cclass.data.data.mod.top.value : 0.01;

        const savesData = data.saves;
        const statsData = data.stats;
        const level     = data.level.value;
        const constitution = data.abilities.con.derived.value;
        savesData.fos.value       = statsData.feat.str.value;
        savesData.fod.value       = statsData.feat.dex.value;
        savesData.turning.value   = statsData['turning'][Object.keys(statsData['turning'])[0]].value + level;
        savesData.morale.value    = statsData['morale'][Object.keys(statsData['morale'])[0]].value;
        savesData.dodge.value     = statsData['dodge'][Object.keys(statsData['dodge'])[0]].value + level;
        savesData.mental.value    = statsData['mental'][Object.keys(statsData['mental'])[0]].value + level;
        savesData.physical.value  = statsData['physical'][Object.keys(statsData['physical'])[0]].value + level;
        savesData.poison.value    = constitution;
        savesData.top.value       = Math.floor(constitution / 2);
        savesData.top.limit.value = Math.ceil((0.3 + leveltop) * data.hp.max);
    }

    setInit(data) {
        const initData = data.stats.init;
        data.init.value = Object.values(initData).reduce((a,b) => a.value + b.value);
    }

    _prepareCharacterData(data) {
        this.setRace(data);
        this.setCClass(data);
        this.setAbilities(data);
        const armorDerived = this.setArmor(data);
        this.setEncumbrance(data);
        this.setWeapons(armorDerived);
        this.setCharacterMaxHP(data);
        this.setCurrentHP(data);
        this.setSaves(data);
        this.setInit(data);
    }

    static async createActor(actor) {
        if (actor.items.size) return;
        const skillPack = game.packs.get('hackmaster5e.uskills');
        const skillIndex = await skillPack.getIndex();
        const uskills = [];
        for (const idx of skillIndex) {
            const skill = await skillPack.getDocument(idx._id);
            uskills.push(skill.data);
        }
        await actor.createEmbeddedDocuments('Item', uskills);
    }
}
