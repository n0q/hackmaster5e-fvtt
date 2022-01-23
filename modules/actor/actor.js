import { HMTABLES } from '../sys/constants.js';

export class HMActor extends Actor {
    prepareBaseData() {
        super.prepareBaseData();
        const actorData = this.data;
        const { data } = actorData;

        if (actorData.type === 'character') {
            this.setRace(data);
            this.setCClass(data);
            this.setAbilities(data);
            this.setAbilityBonuses(data);
        }
        this.setBonusTotal();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        const actorData = this.data;
        const { data } = actorData;

        if (actorData.type === 'character') {
            this.setEncumbrance(data);
            this.setCharacterHP();
            this.setCharacterMaxSP(data);
            return;
        }
        this.setBeastHP();
    }

    async setRace(data) {
        const races = this.items.filter((a) => a.type === 'race');
        if (!races.length) return;
        const race = races.pop();

        data.bonus.race     = race.data.data.bonus;
        data.abilities.race = race.data.data.abilities;

        if (races.length) {
            let oldrace;
            while (oldrace = races.pop()) await oldrace.delete();
        }
    }

    async setCClass(data) {
        const cclasses = this.items.filter((a) => a.type === 'cclass');
        if (!cclasses.length) return;

        const cclass = cclasses.pop();
        data.bonus.class = cclass.data.data.bonus;

        if (cclasses.length) {
            let oldclass;
            while (oldclass = cclasses.pop()) await oldclass.delete();
        }
    }

    setAbilities(data) {
        const { abilities } = data;

        const total = {};
        for (let stat in abilities.base) {
            let value = 0;
            let fvalue = 0;
            for (let row in abilities) {
                if (row === 'total') { continue; };
                value  += abilities[row][stat].value;
                fvalue += abilities[row][stat].fvalue;
            }
            total[stat] = {value, fvalue};
        }
        abilities.total = total;
    }

    setAbilityBonuses(data) {
        const aData = data.abilities.total;

        const stats        = {};
        const abilityBonus = {};

        for (const statName in aData) {
            const clamp = HMTABLES.abilitymods.clamp[statName];
            const statDerived = aData[statName].value + aData[statName].fvalue / 100;
            const statAdj = Math.clamped(statDerived, clamp.min, clamp.max);

            const sidx = Math.floor((statAdj - clamp.min) / clamp.step);
            const bonusTable = HMTABLES.abilitymods[statName][sidx];
            abilityBonus[statName] = bonusTable;
            for (const key in bonusTable) {
                if (bonusTable.hasOwnProperty(key)) {
                    stats[key] = (stats?.[key] || 0) + bonusTable[key];
                    if (key === 'chamod') { aData.cha.value += stats[key] || 0; }
                }
            }
        }

        stats.hp     = aData.con.value;
        stats.poison = aData.con.value;
        stats.trauma = Math.floor(aData.con.value / 2);

        data.bonus.stats = stats;
        data.hmsheet ? data.hmsheet.bonus = abilityBonus
                     : data.hmsheet = {'bonus': abilityBonus};
    }

    setEncumbrance(data) {
        let encumb = 0.0;
        const item = this.items.filter((a) => {
            const aData = a.data.data;
            // TODO: Inventory management
            if (aData.state) {
                if (a.type             === 'armor'
                    && aData.armortype !== 'shield'
                    && aData.state.equipped
                ) return false;
                return aData.state.carried;
            }
        });

        for (let i=0; i < item.length; i++) {
            encumb += item[i].data.data.weight;
        }
        data.encumb = encumb;
    }

    setCharacterHP() {
        const {data} = this.data;
        const max    = data.bonus.total?.hp || 0;
        const wounds = this.items.filter((a) => a.type === 'wound');
        let value = max;
        Object.keys(wounds).forEach((a) => value -= wounds[a].data.data.hp);
        data.hp = {max, value};
    }

    setBeastHP() {
        const {data} = this.data;
        const {max}  = data.hp;
        const wounds = this.items.filter((a) => a.type === 'wound');
        let value = max;
        Object.keys(wounds).forEach((a) => value -= wounds[a].data.data.hp);
        data.hp.value = value;
    }

    setCharacterMaxSP(data) {
        data.sp.max = data.bonus.total?.sp || 0;
    }

    setBonusTotal() {
        const {bonus} = this.data.data;
        const total = {};

        for (const row in bonus) {
            if (row === 'total') { continue; }

            // Dereference indexed key/val pairs;
            if (bonus[row]._idx) {
                const idx = bonus[row]._idx;
                for (const idxKey in idx) {
                    const idxValue = idx[idxKey];
                    const table    = HMTABLES[idxKey][idxValue];
                    bonus[row]     = Object.assign(bonus[row], table);
                }
            }

            for (const key in bonus[row]) {
                const value = bonus[row][key];
                if (key !== '_idx' && value !== null) {
                    total[key] = (total?.[key] || 0) + value;
                }
            }
        }
        bonus.total = total;
    }

    getArmor() {
        let armor = 0;
        let shield = 0;
        const defItems = this.items.filter((a) => a.type === 'armor' &&
                                                  a.data.data.state.equipped);

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

    // Populate hp.max for beast tokens.
    static async createToken(token, _options, userId) {
        const {actor} = token;
        if (actor.type !== 'beast'
            || actor.data.data.hp.max
            || userId !== game.user.id) { return; }

        const {hp} = actor.data.data;
        const {formula} = hp;
        if (Roll.validate(formula)) {
            const r = new Roll(formula);
            await r.evaluate({'async': true});
            hp.value = r.total;
            hp.max = r.total;
            await actor.update({'data.hp': hp});
        }
    }
}
