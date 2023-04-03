import { HMCONST, HMTABLES } from '../tables/constants.js';

export class HMWeaponProfile extends foundry.abstract.DataModel {
    constructor(...args) {
        super(...args);

        const {img, system} = this.weapon;
        const {bonus, ...weaponSystem} = system;
        this.img = img;
        this.system = weaponSystem;
    }

    get minspd() {
        const {system} = this;
        const {ranged} = system;
        if (ranged.checked) return HMTABLES.weapons.ranged.minspd(ranged.timing);
        return HMTABLES.weapons.scale[system.scale].minspd;
    }

    get id() { return this._id; }

    get weaponId() { return this.weapon.id; }

    get actorId() { return this.actor.id; }

    get capabilities() { return this.weapon.capabilities; }

    get canBackstab() { return this.weapon.canBackstab; }

    static defineSchema() {
        const {fields} = foundry.data;
        return {
            _id: new fields.DocumentIdField({initial: foundry.utils.randomID()}),
            name: new fields.StringField({blank: false}),
            weapon: new fields.ObjectField({blank: false, required: true}),
            actor: new fields.ObjectField({blank: false, required: true}),
        };
    }

    _getWeaponSpeed(vector) {
        const {spd, spdm, spdr} = vector;
        return this.system.ranged.checked
            ? (spd || 0) + (spdr || 0)
            : (spd || 0) + (spdm || 0);
    }

    _getSpecialization() {
        if (this.actor.type === 'beast') return {};

        const {system} = this.weapon;
        const {base} = system.bonus;
        const {skill, proficiency, ranged} = system;

        const profItem = this.actor.itemTypes.proficiency
            .find((a) => a.name === proficiency && a.system.weapon.checked);
        const {noProf} = HMTABLES.weapons;

        const vector = ranged.checked
            ? noProf.weaponType.ranged
            : noProf.weaponType.melee;
        const [classItem] = this.actor.itemTypes.cclass;
        const profCf = classItem.system.caps.hprof ? 0.5 : 1.0;

        const spec = {};
        Object.keys(base).forEach((stat, i) => {
            spec[stat] = profItem
                ? profItem.system.bonus[stat] || 0
                : parseInt(noProf.skill[skill] * vector[i] * profCf, 10);
        });

        return spec;
    }

    _getWeaponTalent(bonus) {
        if (this.actor.type === 'beast') return {};

        const {proficiency} = this.weapon.system;
        const itemTalent = this.actor.itemTypes.talent.find(
            (a) => a.name === proficiency && a.system.type === HMCONST.TALENT.WEAPON,
        );
        const total = itemTalent ? itemTalent.system.bonus : {};

        if (!bonus) return total;
        Object.keys(bonus).forEach((stat) => {
            total[stat] = (total[stat] || 0) + (bonus[stat] || 0);
        });

        return total;
    }

    evaluate() {
        const [actor, weapon] = [this.actor, this.weapon];
        const weaponBonus = weapon.system.bonus;
        const actorBonus = actor.system.bonus;

        const {mod} = weaponBonus;
        const base = weaponBonus.total;
        const bonus = {base, mod};

        const {ranged} = this.system;
        const isMechanical = ranged.checked && ranged.mechanical;

        let reachOffset = 0;

        const spec = this._getSpecialization();
        const talent = this._getWeaponTalent(actorBonus.talent);
        const bonusObj = {...actorBonus, spec, talent};

        Object.keys(bonusObj).sort().forEach((vector) => {
            if (vector === 'total') return;
            const {atk, def, dmg, reach} = bonusObj[vector];
            const spd = this._getWeaponSpeed(bonusObj[vector]);
            if (reach) reachOffset += reach;

            if (atk || def || dmg || spd) {
                bonus[vector] = {
                    atk:   atk || 0,
                    def:   def || 0,
                    dmg:   isMechanical && vector === 'stats' ? 0 : dmg || 0,
                    spd:   spd || 0,
                };
            }
        });

        const total = {};
        Object.keys(base).forEach((stat) => {
            total[stat] = Object.keys(bonus)
                                .reduce((sum, vector) => sum + (bonus[vector][stat] || 0), 0);
        });

        const jspd = total.spd + bonus.base.jspd - bonus.base.spd;
        total.jspd = Math.max(this.minspd, jspd);
        total.spd = Math.max(this.minspd, total.spd);
        this.system.bonus = {total, ...bonus};
        this.system.reach = Math.max(0, weapon.system.reach + reachOffset);
    }
}
