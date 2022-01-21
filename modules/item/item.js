import { HMTABLES } from '../sys/constants.js';

export class HMItem extends Item {
    prepareBaseData() {
        super.prepareBaseData();
        const {data, type} = this.data;
        const actorData = this.actor ? this.actor.data : null;

        if (type === 'armor')       { this._prepArmorData();                      }
        if (type === 'cclass')      { this._prepCClassData(data, actorData);      } else
        if (type === 'proficiency') { this._prepProficiencyData(data, actorData); }
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        const {data, type} = this.data;
        const actorData = this.actor ? this.actor.data : null;

        if (type === 'skill')       { this._prepSkillData(data, actorData);       } else
        if (type === 'weapon')      { this._prepWeaponData(data, actorData);      }
    }

    _prepArmorData() {
        if (!this.actor) { return; }
        const {bonus} = this.data.data;

        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const row in bonus) { sum += bonus[row][key]; }
            bonus.total[key] = sum;
        }
    }

    async _prepCClassData(data, actorData) {
        const pTable = data.ptable;

        // initialize new cclass object ptable
        if (Object.entries(pTable).length === 0) {
            const pData = HMTABLES.skill._pData;
            for (let i = 1; i < 21; i++) pTable[i] = deepClone(pData);
            if (Object.entries(pTable).length) return;
            await this.update({'data.ptable': pTable});
        }

        // calculate hp
        if (!actorData) return;
        const level = data.level;
        let hp = 0;

        let rerolled = false;
        let hpStack = [];
        let i = 0;
        while (i++ < level) {
            const reroll = pTable[i].hp.reroll;

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

            hpStack.push(parseInt(pTable[i].hp.value) || 0);
            if (reroll) rerolled = true;
        }
        hp += Math.max(...hpStack);
        const bonus = { hp };

        // grab the level data off the ptable
        const feature = data.features;
        for (let i in feature) {
            bonus[i] = feature[i] ? pTable[level][i].value || 0 : 0;
        }

        // Saves
        bonus.turning  = level;
        bonus.dodge    = level;
        bonus.mental   = level;
        bonus.physical = level;
        bonus.top = (data.top_cf || 0.01) * level;
        await this.update({'data.bonus': bonus});
    }

    // TODO: A user can technically set defense and damage, then
    // set a weapon to ranged. These values should be culled.
    _prepProficiencyData(data, actorData) {
        if (data.mechanical.checked && !data.ranged.checked) {
            return this.update({'data.mechanical.checked': false});
        }
    }

    _prepSkillData(data, actorData) {
        if (!actorData) return;

        const { bonus, relevant } = data;
        if (data.universal && bonus.mastery.value === 0) {
            const abilities = actorData.data.abilities.total;
            const stack = [];

            for (const key in relevant) {
                if (relevant[key]) stack.push(abilities[key].value);
            }
            const value = Math.min(...stack);
            bonus.stats = {value, 'literacy': value, 'verbal': value};
        } else { delete bonus.stats; }

        for (const key in bonus.total) {
            let sum = -bonus.total[key];
            for (const state in bonus) { sum += (bonus[state][key] || 0); }
            bonus.total[key] = sum;
        }
    }

    _prepWeaponData(itemData, actorData) {
        if (!actorData) return;

        const armors   = [];
        const shields  = [];
        const armor    = {};
        const shield   = {};
        const defItems = actorData.items.filter((a) => a.type === 'armor' &&
                                                       a.data.data.state.equipped);

        // Splitting armor and shields for now, so we can manage stances later.
        for (let i = 0; i < defItems.length; i++) {
            const defItem = defItems[i];
            const defData = defItem.data.data;
            // Without having finer control over prepData order, we must foce a prep here.
            defItem.prepareData();
            defData.shield.checked ? shields.push(defItem) : armors.push(defItem);
        }

        const bonus     = itemData.bonus;

        const cclass    = {};
        const race      = {};
        const stats     = {};
        const classData = actorData.data.bonus.class;
        const statsData = actorData.data.bonus.stats;
        const raceData  = actorData.data.bonus.race;

        const spec      = {};
        const profTable = HMTABLES.weapons.noprof;
        const wSkill    = itemData.skill;
        const profItem  = actorData.items.find((a) => {
            return a.type === "proficiency" && a.name === itemData.proficiency;
        });

        let j = 0;
        for (let key in bonus.total) {
            const profBonus = profItem ? profItem.data.data.bonus?.[key] || 0
                                       : profTable.table[wSkill] * profTable.vector[j++];
            spec[key]   = profBonus || 0;
            cclass[key] = classData?.[key] || 0;
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
        if (!Object.values(stats).every( a => a === 0)) { bonus.stats = stats; }
        if (!Object.values(spec).every( a => a === 0)) { bonus.spec = spec; }
        if (!Object.values(cclass).every( a => a === 0)) { bonus.class = cclass; }
        if (!Object.values(race).every( a => a === 0)) { bonus.race = race; }
        if (!Object.values(armor).every( a => a === 0)) { bonus.armor = armor; }
        if (!Object.values(shield).every( a => a === 0)) { bonus.shield = shield; }

        for (let key in bonus.total) {
            let sum = -bonus.total[key];
            for (let state in bonus) { sum += bonus[state][key]; }
            bonus.total[key] = sum;
        }
    }

    onClick(event) {
        const itemType = this.type;
        if (itemType === 'wound') { this.WoundAction(event); }
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const dataset = element.dataset;
        const itemData = this.data.data;

        let {hp, timer, treated} = itemData;
        let dirty = false;

        if (dataset.action === 'decTimer') timer--;
        if (dataset.action === 'decHp' || timer < 1) {
            timer = --hp;
            dirty = true;
        }

        if (hp < 0) return this.delete();
        await this.update({'data': {hp, timer, treated}});
        if (dirty && this.parent) {
            this.parent.modifyTokenAttribute('data.hp');
        }
    }

    // Workaround until foundry issue 6508 is resolved.
    static async createItem(item) {
        if (item.type === 'wound' && item.parent) {
            item.parent.modifyTokenAttribute('data.hp');
        }
    }

    static async deleteItem(item) {
        if (item.type === 'wound' && item.parent) {
            item.parent.modifyTokenAttribute('data.hp');
        }
    }
}
