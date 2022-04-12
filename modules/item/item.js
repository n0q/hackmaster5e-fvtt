import { HMTABLES } from '../sys/constants.js';

// Remember: Items may not alter Actors under any circumstances.
// You will create a free fire shooting gallery if you do this, and
// we are making Hackmaster, not Aces & Eights.

export class HMItem extends Item {
    /** @override */
    prepareData(options={}) {
        this.data.reset();
        this.prepareBaseData(options);
        super.prepareEmbeddedDocuments();
        this.prepareDerivedData();
    }

    /** @override */
    prepareBaseData(options={}) {
        super.prepareBaseData();

        // HACK: This will suffice for now.
        if (typeof this.data.data?.state === 'object') this._shittyMigrate();

        const {type} = this.data;
        if (type === 'armor')       { this._prepArmorData(options); } else
        if (type === 'cclass')      { this._prepCClassData();       } else
        if (type === 'race')        { this._prepRace();             } else
        if (type === 'proficiency') { this._prepProficiencyData();  }
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        const {type} = this.data;
        if (type === 'skill')  { this._prepSkillData();  } else
        if (type === 'weapon') { this._prepWeaponData(); }
    }

    // TODO: When we do migration for real, ensure typeof data.state === 'integer'
    async _shittyMigrate() {
        await this.update({'data.state': 0});
    }

    get quality() {
        const {data} = this.data;
        const qKey = data?.ranged?.checked ? 'ranged' : this.type;
        const {bonus, qn} = data;
        const values = HMTABLES.quality[qKey].map((a) => a * qn);
        const keys = Object.keys(bonus.total);
        return Object.fromEntries(keys.map((_, i) => [keys[i], values[i]]));
    }

    // HACK: Temporary measure until future inventory overhaul.
    get invstate() {
        // TODO: Migrate
        const state = parseInt(this.data.data.state, 10) || 0;
        return HMTABLES.itemstate[state];
    }

    _prepRace() {
        const {data} = this.data;
        const {bonus, scale} = data;

        const scaleTable = HMTABLES.scale;
        Object.keys(scale).forEach((key) => {
            const idx = data.scale[key];
            if (idx > 0) { bonus[key] = scaleTable[idx][key]; }
        });
    }

    _prepArmorData({setBonus=true}={}) {
        if (!this.actor?.data) { return; }
        const {bonus, shield, qn} = this.data.data;
        qn ? bonus.qual = this.quality : delete bonus.qual;
        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const row in bonus) { sum += bonus[row][key]; }
            bonus.total[key] = sum;
        }

        // Populate armor and shield vectors on actor.
        // TODO: Items should never do this to actors.
        if (setBonus && this.invstate === 'equipped') {
            const actorBonus = this.actor.data.data.bonus;
            const aVector = actorBonus?.armor || {};
            const sVector = actorBonus?.shield || {};
            const sum = shield.checked ? sVector : aVector;

            Object.keys(bonus.total).forEach((key) => {
                sum[key] = (sum[key] || 0) + bonus.total[key];
            });

            shield.checked ? actorBonus.shield = sum
                           : actorBonus.armor  = sum;
        }
    }

    async _prepCClassData() {
        const {data} = this.data;
        const pTable = data.ptable;

        // initialize new cclass object ptable
        if (Object.entries(pTable).length === 0) {
            const {pData} = HMTABLES.skill;
            for (let i = 1; i < 21; i++) pTable[i] = deepClone(pData);
            if (Object.entries(pTable).length) return;
            await this.update({'data.ptable': pTable});
        }

        if (!this.actor?.data) { return; }

        // calculate hp
        const level = Math.clamped((data.level || 0), 0, 20);
        if (level < 1) {
            delete data.bonus;
            return;
        }

        let hp = 0;
        let rerolled = false;
        let hpStack = [];
        let i = 0;
        while (i++ < level) {
            const {reroll} = pTable[i].hp;

            // end of a reroll chain
            if (!reroll && rerolled) {
                hp += Math.max(...hpStack);
                rerolled = false;
                hpStack = [];
            }

            // there was no reroll chain
            if (!reroll && !rerolled && hpStack.length === 1) {
                hp += hpStack.pop();
            }

            hpStack.push(parseInt(pTable[i].hp.value, 10) || 0);
            if (reroll) rerolled = true;
        }

        const bonus = {
            'hp':       hp + Math.max(...hpStack),
            'turning':  level,
            'dodge':    level,
            'mental':   level,
            'physical': level,
            'top':      (data.top_cf || 0.01) * level,
        };

        // grab the level data off the ptable
        const {features} = data;
        Object.keys(features).forEach((idx) => {
            bonus[idx] = features[idx] ? pTable[level][idx].value || 0 : 0;
        });

        data.bonus = bonus;
    }

    // TODO: A user can technically set defense and damage, then
    // set a weapon to ranged. These values should be culled.
    _prepProficiencyData() {
        const {data} = this.data;
        if (data.mechanical.checked && !data.ranged.checked) {
            return this.update({'data.mechanical.checked': false});
        }
    }

    _prepSkillData() {
        if (!this.actor?.data) { return; }

        const actorData = this.actor.data;
        const {bonus, relevant, universal} = this.data.data;

        if (this.actor.type === 'character') {
            if (universal && bonus.mastery.value === 0) {
                const abilities = actorData.data.abilities.total;
                const stack = [];

                for (const key in relevant) {
                    if (relevant[key]) { stack.push(abilities[key].value); }
                }
                const value = Math.min(...stack);
                bonus.stats = {value, 'literacy': value, 'verbal': value};
            } else { delete bonus.stats; }
        }

        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += (bonus[state][key] || 0); }
            bonus.total[key] = sum;
        }
    }

    _prepWeaponData() {
        if (!this.actor?.data) { return; }
        const actorData   = this.actor.data;
        const itemData    = this.data.data;

        const {ranged}    = itemData;
        const isCharacter = actorData.type === 'character';
        const armors      = [];
        const shields     = [];
        const armor       = {};
        const shield      = {};
        const defItems    = actorData.items.filter((a) => a.type === 'armor'
                                                       && a.invstate === 'equipped');

        // HACK: This belongs in item-sheet.js, which needs a refactor.
        const {reach} = this.data.data;
        const offset = this.parent.data.data.bonus.total.reach || 0;
        itemData.adjReach = Math.max(reach + offset, 0) || 0;

        // Splitting armor and shields for now, so we can manage stances later.
        for (let i = 0; i < defItems.length; i++) {
            const defItem = defItems[i];
            const defData = defItem.data.data;
            // Without having finer control over prepData order, we must force a prep here.
            defItem.prepareData({setBonus: false});
            defData.shield.checked ? shields.push(defItem) : armors.push(defItem);
        }

        const {bonus}   = itemData;
        const qual      = this.quality;
        const cclass    = {};
        const misc      = {};
        const race      = {};
        const stats     = {};
        const classData = actorData.data.bonus.class;
        const miscData  = actorData.data.bonus.misc;
        const statsData = actorData.data.bonus.stats;
        const raceData  = actorData.data.bonus.race;

        const spec      = {};
        const profTable = HMTABLES.weapons.noprof;
        const wSkill    = itemData.skill;
        const profItem  = actorData.items.find((a) => {
            return a.type === 'proficiency' && a.name === itemData.proficiency;
        });

        let j = 0;
        for (const key in bonus.total) {
            const profBonus = profItem ? profItem.data.data.bonus?.[key] || 0
                                       : profTable.table[wSkill] * profTable.vector[j++];
            spec[key]   = profBonus || 0;
            cclass[key] = classData?.[key] || 0;
            misc[key]   = miscData?.[key] || 0;
            race[key]   = raceData?.[key] || 0;
            stats[key]  = statsData?.[key] || 0;

            // Explicitly allowing multiple armor/shields because we don't support accesories yet.
            for (let i = 0; i < armors.length; i++)  {
                const armorData = armors[i].data.data.bonus.total;
                armor[key] = (armor[key] || 0) + (armorData[key] || 0);
            }
            for (let i = 0; i < shields.length; i++)  {
                const shieldData = shields[i].data.data.bonus.total;
                shield[key] = (shield[key] || 0) + (shieldData[key] || 0);
            }
        }

        if (ranged.checked) {
            // TODO: Provide flag to use strength damage or not.
            stats.dmg = 0;
            cclass.spd = Math.min(cclass.spd, classData?.spdr || cclass.spd);
        } else {
            cclass.spd = Math.min(cclass.spd, classData?.spdm || cclass.spd);
        }

        // TODO: Build a new data.data.bonus rather than clean the old one.
        Object.values(qual).every((a) => a === 0)   ? delete bonus.qual   : bonus.qual   = qual;
        Object.values(armor).every((a) => a === 0)  ? delete bonus.armor  : bonus.armor  = armor;
        Object.values(shield).every((a) => a === 0) ? delete bonus.shield : bonus.shield = shield;
        Object.values(misc).every((a) => a === 0)   ? delete bonus.misc   : bonus.misc   = misc;

        if (isCharacter) {
            Object.values(stats).every((a) => a === 0)  ? delete bonus.stats : bonus.stats = stats;
            Object.values(cclass).every((a) => a === 0) ? delete bonus.class : bonus.class = cclass;
            Object.values(race).every((a) => a === 0)   ? delete bonus.race  : bonus.race  = race;
            Object.values(spec).every((a) => a === 0)   ? delete bonus.spec  : bonus.spec  = spec;
        }

        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += bonus[state][key]; }
            bonus.total[key] = sum;
        }
    }

    onClick(event) {
        const itemType = this.type;
        if (itemType === 'wound') { this.WoundAction(event); }
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const {dataset} = element;
        const itemData = this.data.data;

        let {hp, timer, treated} = itemData;

        if (dataset.action === 'decTimer') timer--;
        if (dataset.action === 'decHp' || timer < 1) timer = --hp;

        if (hp < 0) return this.delete();
        await this.update({'data': {hp, timer, treated}});
    }
}
