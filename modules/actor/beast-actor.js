import { HMActor } from './actor.js';

export class HMBeastActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setExtras();
        this.setBonusTotal();
        this.setSP();
        this.setHP();
        this.prepareWeaponProfiles();
    }

    get movespd() {
        let movespd = Object.values(this.system.movespd.gnd);
        const armorMove = this.system.bonus.armor?.move || 1;

        if (armorMove !== 1) {
            const armorPenalty = [1, 1, armorMove, armorMove, armorMove];
            movespd = movespd.map((move, i) => move * armorPenalty[i]);
        }
        return movespd;
    }

    setExtras() {
        const {bonus} = this.system;
        if (bonus.stats === undefined) bonus.stats = {};
        const {misc, stats} = this.system.bonus;
        stats.poison = (misc.trauma || 0) * 2;
        misc.slvl = parseInt(this.system.level, 10) || 0;
    }

    setSP() {
        const {bonus, sp} = this.system;
        if (bonus.stats === undefined) bonus.stats = {};
        sp.max = bonus.total?.sp || 0;
    }

    setHP() {
        super.setHP();
        const {bonus, hp} = this.system;
        const tenacity = Math.ceil(hp.max * bonus.total.tenacityCf || 0);
        delete hp.tenacity;
        if (tenacity > 0) hp.tenacity = tenacity;
    }

    // Placeholder value.
    getAbilityBonus() { return 2; } // eslint-disable-line

    /**
     * onWound event handler.
     * @param {boolean} traumaCheck - True if a trauma check is required.
     * @param {boolean} tenacityCheck - True if a tenacity check is required.
     */
    onWound(traumaCheck, tenacityCheck) {
        const rollSaveData = {
            caller: this,
            context: this,
            dialog: 'save',
            resp: {bonus: 0, rollMode: CONST.DICE_ROLL_MODES.PRIVATE},
            mdata: {alert: true},
        };

        if (traumaCheck) this.rollSave({...rollSaveData, formulaType: 'trauma'});
        if (tenacityCheck) this.rollSave({...rollSaveData, formulaType: 'tenacity'});
    }
}
