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

    setAbilityBonuses(data) {
        const aData = data.abilities;
        const bonus = data.bonus;

        const stats        = {};
        const abilityBonus = {};

        for (let statName in aData) {
            const clamp = HMTABLES.abilitymods.clamp[statName];
            const statDerived = aData[statName].derived.value + aData[statName].derived.fvalue / 100;
            const statAdj = Math.clamped(statDerived, clamp.min, clamp.max);

            const sidx = Math.floor((statAdj - clamp.min) / clamp.step);
            const bonusTable = HMTABLES.abilitymods[statName][sidx];
            abilityBonus[statName] = bonusTable;
            for (let key in bonusTable) {
                if (bonusTable.hasOwnProperty(key)) {
                    stats[key] = (stats?.[key] || 0) + bonusTable[key];
                    if (key === 'chamod') { data.abilities.cha.derived.value += (bonus.chamod || 0); }
                }
            }
        }
        data.bonus.stats = stats;
        data.hmsheet ? data.hmsheet.bonus = abilityBonus
                     : data.hmsheet = {'bonus': abilityBonus};
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
        const bonus  = data.bonus;
        const stats  = bonus?.stats ? bonus.stats : {};
        const cclass = bonus?.class ? bonus.class : {};
        const level  = data.level.value;
        const con    = data.abilities.con.derived.value;

        cclass.turning  = level;
        cclass.dodge    = level;
        cclass.mental   = level;
        cclass.physical = level;
        stats.poison    = con;
        stats.trauma    = Math.floor(con / 2);

        bonus.class = cclass;
        bonus.stats = stats;
    }

    setBonusTotal(data) {
        const bonus = data.bonus;
        const total = {};
        for (let row in bonus) {
            if (row === 'total') { continue; }
            for (let key in bonus[row]) { total[key] = (total?.[key] || 0) + bonus[row][key]; }
        }
        bonus.total = total;
        return total;
    }

    _prepareCharacterData(data) {
        this.setRace(data);
        this.setAbilities(data);
        this.setAbilityBonuses(data);
        this.setCClass(data);
        this.setEncumbrance(data);
        this.setCharacterHP(data);
        this.setCharacterMaxSP(data);
        this.setSaves(data);
        this.setBonusTotal(data);
    }

    getArmor() {
        let armor = 0;
        let shield = 0;
        const defItems = this.items.filter((a) => a.type === 'armor' &&
                                                  a.data.data.state.equipped.checked);

        for (let i = 0; i < defItems.length; i++) {
            const defData = defItems[i].data.data;
            defData.shield.checked ? shield += defData.bonus.total.dr
                                   : armor  += defData.bonus.total.dr;
        }
        return {armor, shield};
    }

    static async createActor(actor) {
        if (actor.items.size) return;
        const skillPack = game.packs.get('hackmaster5e.uskills');
        const skillIndex = await skillPack.getIndex();
        const uskills = [];
        for (const idx of skillIndex) {
            const skill = await skillPack.getDocument(idx._id);
            const translated = game.i18n.localize(skill.data.name);
            if (translated != '') {
                skill.data.name = translated;
            }
            uskills.push(skill.data);
        }
        await actor.createEmbeddedDocuments('Item', uskills);
    }
}
