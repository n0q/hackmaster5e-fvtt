import { HMCONST, HMTABLES, SYSTEM_ID } from "../tables/constants.js";
import { HMActor } from "./actor.js";
import { HMChatFactory, CHAT_TYPE } from "../chat/chat-factory.js";

export class HMCharacterActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
        this.hmMigrate();
        this.setRace();
        this.setCClass();
        this.setAbilities();
        this.setAbilityBonuses();
        this.setEncumbrance();
        this.setHonor();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setBonusTotal();
        this.setHP();
        this.setExtras();
        this.prepareWeaponProfiles();
    }

    // Temporary migration code. This will eventually go into a schema file.
    hmMigrate() {
        const { priors } = this.system;
        if (Number.isInteger(priors.sex)) return;

        const { SEX } = HMCONST.PRIORS;
        const match = priors.sex.toLowerCase().match(/(.).*/)?.[1];
        const sex = match === "m" ? SEX.MALE : SEX.FEMALE;
        this.update({ "system.priors.sex": sex });
    }

    get movespd() {
        const raceMove = Number(this.system.bonus.race?.move || 0);
        let movespd = Object.values(HMTABLES.movespd).map(x => x * raceMove);

        const armorMove = Number(this.system.bonus.armor?.move || 1);
        if (armorMove !== 1) {
            const armorPenalty = [1, 1, armorMove, armorMove, armorMove];
            movespd = movespd.map((move, i) => move * armorPenalty[i]);
        }
        return movespd;
    }

    get encumbrance() {
        const { idx } = this.system.abilities.total.str;
        return [...HMTABLES.abilitymods.encumbrance[idx], Infinity];
    }

    resetBonus() {
        super.resetBonus();
        const { ITEM_STATE } = HMCONST;
        const hasArmor = this.itemTypes.armor.find(a => a.system.state === ITEM_STATE.EQUIPPED
            && !a.system.isShield);

        if (!hasArmor) this.system.bonus.armor = { init: -1 };
    }

    setAbilities({ adjust, delta } = {}) {
        const { abilities } = this.system;
        if (!abilities.total) abilities.total = {};

        // Looks adjusts Charisma, so we will need to do a second pass.
        const abilitiesIter = adjust ? [adjust] : Object.keys(abilities.base);
        abilitiesIter.forEach(stat => {
            let { value, fvalue } = abilities.base[stat];
            fvalue = (fvalue + 99) % 100;

            Object.keys(abilities).forEach(vector => {
                if (vector === "total" || vector === "base") return;
                value += abilities[vector][stat].value;
                fvalue += abilities[vector][stat].fvalue;
            });

            value += Math.floor(fvalue / 100) + (delta || 0);
            fvalue = ((fvalue % 100) + 100) % 100;

            const clamp = HMTABLES.abilitymods.clamp[stat];
            const statSum = value + (fvalue / 100);
            const statAdj = Math.clamp(statSum, clamp.min, clamp.max);
            const idx = Math.floor((statAdj - clamp.min) / clamp.step);

            fvalue = (fvalue + 101) % 100;
            if (value < 1) [value, fvalue] = [1, 1];
            abilities.total[stat] = { value, fvalue, idx };
        });
    }

    setAbilityBonuses() {
        const { system } = this;
        const { total } = system.abilities;

        const stats = {};
        const abilityBonus = {};

        Object.keys(total).forEach(statName => {
            const { idx } = total[statName];
            const bonusTable = HMTABLES.abilitymods[statName][idx];
            abilityBonus[statName] = bonusTable;

            Object.keys(bonusTable).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(bonusTable, key)) {
                    stats[key] = (stats?.[key] || 0) + bonusTable[key];
                    if (key === "chamod") this.setAbilities({ adjust: "cha", delta: stats[key] });
                }
            });

            /* @todo Another hack to be replaced when we move to a stats object. */
            stats.sfc = parseInt(system.abilities.total.int.value, 10) || 0;
        });

        stats.hp = total.con.value;
        stats.poison = total.con.value;
        stats.trauma = Math.floor(total.con.value / 2);

        system.bonus.stats = stats;
        system.hmsheet ? system.hmsheet.bonus = abilityBonus
            : system.hmsheet = { bonus: abilityBonus };
    }

    setEncumbrance() {
        const item = this.items.filter(a => {
            const data = a.system;
            if (!("state" in data)) return false;
            return true;
        });

        let carried = 0.0;
        let armor = 0.0;
        for (let i = 0; i < item.length; i++) {
            const { invstate } = item[i];
            const { system, type, weight } = item[i];
            switch (invstate) {
                case "innate": break;

                case "equipped": {
                    if (type === "armor" && !system.isShield) armor += weight.total;
                }
                // Falls through

                case "carried": {
                    carried += weight.total;
                    break;
                }
                default:
            }
        }

        const effective = carried - armor;
        const { priors } = this.system;
        const total = carried + HMTABLES.weight(priors.bmi, priors.height) || 0.0;
        const encumb = { carried, effective, total };

        if (game.settings.get(SYSTEM_ID, "autoEncumbrance")) {
            const { idx } = this.system.abilities.total.str;
            const encumbrance = [...HMTABLES.abilitymods.encumbrance[idx], Infinity];
            encumb.penalty = encumbrance.findIndex(x => effective <= x);
        } else encumb.penalty = this.getFlag(SYSTEM_ID, "encumbrance");

        this.system.bonus.encumb = HMTABLES.encumbrance[encumb.penalty];
        this.encumb = encumb;
    }

    setHonor() {
        const cclass = this.items.find(a => a.type === "cclass");
        if (!cclass) return;

        const { system } = this;
        const { level } = cclass.system;
        const hValue = parseInt(system.honor.value, 10) || 0;

        const bracket = HMTABLES.bracket.honor(level, hValue) || 0;
        const value = Math.min(hValue, 999);
        system.honor = { bracket, value };

        if (bracket < HMCONST.HONOR.LOW) {
            system.bonus.honor = HMTABLES.bracket.dishonor();
        }
    }

    setExtras() {
        const { system } = this;
        system.sp.max = system.bonus.total?.sp || 0;
        system.luck.max = system.bonus.total?.luck || 0;

        const fValue = parseInt(system.fame.value, 10) || 0;
        system.fame.bracket = HMTABLES.bracket.fame(fValue) || 0;
        system.fame.value = Math.min(fValue, 999);

        const { priors } = system;
        priors.weight = HMTABLES.weight(priors.bmi || 0, priors.height || 0);
    }

    setCClass() {
        const { system } = this;
        const cclasses = this.itemTypes.cclass;
        if (!cclasses.length) return;

        const cclass = cclasses[0];
        cclass.prepareBaseData();

        const objData = cclass.system;
        if (objData.level) system.bonus.class = objData.bonus;
        const { level } = cclass.system;
        system.ep.max = HMTABLES.cclass.epMax[level];
    }

    setRace() {
        const { system } = this;
        const races = this.itemTypes.race;
        if (!races.length) return;

        const race = races[0];
        race.prepareBaseData();

        system.bonus.race = race.system.bonus;
        system.abilities.race = race.system.abilities;
    }

    getAbilityBonus(ability, bonus) {
        const { idx } = this.system.abilities.total[ability];
        return HMTABLES.abilitymods[ability][idx][bonus];
    }

    /**
     * Checks for wound-related events (trauma, and so on).
     * Inflicts armor damage if needed.
     *
     * @param {HMWoundItem} item
     */
    async _onWound(item) {
        const woundSystem = item.system;
        const hpTramaLimit = this.system.hp.top;
        const { armorDamage, assn } = item.flags[SYSTEM_ID];

        if (armorDamage > 0) this._onArmorDamage(armorDamage);
        const needsTraumaCheck = hpTramaLimit < (woundSystem.hp + assn);
        if (!needsTraumaCheck) return;

        const bData = { caller: this.uuid };
        const builder = await HMChatFactory.create(CHAT_TYPE.ALERT_NOTE, bData);
        const ALERT_TYPE = builder.ALERT_TYPE;
        builder.update("mdata", { type: ALERT_TYPE.TRAUMA });
        builder.createChatMessage();
    }
}
