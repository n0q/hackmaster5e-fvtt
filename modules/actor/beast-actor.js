import { HMActor } from './actor.js';

export class HMBeastActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
        this.setBonusTotal();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setExtras();
        this.setBonusTotal();
        this.setSP();
        this.setHP();
    }

    get movespd() {
        const move = this.data.data.bonus.total.move ?? 1;
        return Object.values(this.data.data.movespd.gnd).map((x) => x * move);
    }

    setExtras() {
        const {bonus} = this.data.data;
        if (bonus.stats === undefined) bonus.stats = {};
        const {misc, stats} = this.data.data.bonus;
        stats.poison = (misc.trauma || 0) * 2;
    }

    setSP() {
        const {bonus, sp} = this.data.data;
        if (bonus.stats === undefined) bonus.stats = {};
        sp.max = bonus.total?.sp || 0;
    }

    setHP() {
        super.setHP();
        const {bonus, hp} = this.data.data;
        const tenacity = Math.ceil(hp.max * bonus.total.tenacityCf || 0);
        delete hp.tenacity;
        if (tenacity > 0) hp.tenacity = tenacity;
    }
}
