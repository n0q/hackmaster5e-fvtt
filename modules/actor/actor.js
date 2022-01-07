import { HMTABLES } from '../sys/constants.js';

export class HMActor extends Actor {
    prepareDerivedData() {
        const actorData = this.data;
        const data = actorData.data;

        if (actorData.type === 'character') { this._prepareCharacterData(data); }
    }

    async setRace(data) {
        const races = this.items.filter((a) => a.type === 'race');
        if (!races.length) return;
        const race = races.pop();

        if (races.length) {
            let oldrace;
            while (oldrace = races.pop()) await oldrace.delete();
        }
        const raceData = race.data.data;
        data.body.def.race.value = raceData.def.value;
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
            let value  = stat.raw.value  + stat.mod.value  + race.value;
            let fvalue = stat.raw.fvalue + stat.mod.fvalue + race.fvalue;
            stat.derived = {value, fvalue};
        }
    }

    async setAbilityBonuses(data) {
        const bonuses = data.bonus;
        for (const bonus in bonuses) {
            const bData = bonuses[bonus];
            bData.value = 0;
            bData.value = Object.values(bData).reduce((sum, a) => (sum + (a?.value || 0)));
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
            if (!armorData.state.equipped.checked) continue;

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
        const weapons = this.items.filter((a) => a.type === 'weapon');
        const race    = this.items.find((a) => a.type === 'race');
        const noprof  = HMTABLES.weapons.noprof;

        for (let i = 0; i < weapons.length; i++) {
            const data   = weapons[i].data.data;
            const stats  = data.stats;
            const wSkill = data.skill;
            const wProf  = data.proficiency;
            const bData  = this.data.data.bonus;

            const cclass = this.items.find((a) => a.type === "cclass");
            const cData = cclass ? cclass.data.data.mod : null;

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

                let classValue = 0;
                if (cclass) classValue = cData?.[key]?.value || 0;
                stats[key].cclass = {"value": classValue};

                const bonusValue = bData?.[key]?.value || 0;
                stats[key].bonus = {"value": bonusValue};

                stats[key].race = race?.data?.data?.[key] || {value: 0};

                stats[key].derived = {value: stats[key].value
                                           + stats[key].misc.value
                                           + stats[key].prof.value
                                           + stats[key].armor.value
                                           + stats[key].cclass.value
                                           + stats[key].bonus.value
                                           + stats[key].race.value
                }
            }
        }
    }

    setCharacterHP(data) {
        const race      = this.items.find((a) => a.type === "race");
        const racial_hp = race ? race.data.data.hp.value : 0;
        const con_hp    = data.abilities.con.derived.value || 0;
        const cclass    = this.items.find((a) => a.type === "cclass");
        const level_hp  = cclass ? cclass.data.data.mod.hp.value : 0;

        const max       = racial_hp + con_hp + level_hp;
        const wounds    = this.items.filter((a) => a.type === "wound");

        let value = max;
        Object.keys(wounds).forEach( (a) => value -= wounds[a].data.data.hp.value);
        data.hp = {max, value};
    }

    setCharacterMaxSP(data) {
        const cclass = this.items.find((a) => a.type === "cclass");
        data.sp.max = data.sp.mod.value;
        if (cclass) data.sp.max += cclass.data.data.mod.sp.value;
    }

    setSaves(data) {
        // actor.js is probably the wrong place to do this. Also SPoT should be constants.js.
        const cclass    = this.items.find((a) => a.type === 'cclass');
        const leveltop  = cclass ? cclass.data.data.mod.top.value : 0.01;

        const bData = data.bonus;
        const sData = data.saves;
        const level = data.level.value;
        const constitution = data.abilities.con.derived.value;

        sData.fos.value          = bData.fos.value;
        sData.foa.value          = bData.foa.value;
        sData.turning.value      = bData.turning.value + level;
        sData.morale.value       = bData.morale.value;
        sData.dodge.value        = bData.dodge.value + level;
        sData.mental.value       = bData.mental.value + level;
        sData.physical.value     = bData.physical.value + level;
        sData.poison.value       = constitution;
        sData.trauma.value       = Math.floor(constitution / 2);
        sData.trauma.limit.value = Math.ceil((0.3 + leveltop) * data.hp.max);
    }

    setInit(data) {
        const bData = data.bonus;
        data.init.value = bData.init.value;
    }

    _prepareCharacterData(data) {
        this.setRace(data);
        this.setAbilities(data);
        this.setAbilityBonuses(data);
        this.setCClass(data);
        const armorDerived = this.setArmor(data);
        this.setEncumbrance(data);
        this.setWeapons(armorDerived);
        this.setCharacterHP(data);
        this.setCharacterMaxSP(data);
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
