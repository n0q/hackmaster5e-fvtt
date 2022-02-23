import { HMActor } from './actor.js';

export class HMBeastActor extends HMActor {
    prepareBaseData() {
        super.prepareBaseData();
        this.setExtras();
        this.setBonusTotal();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.setBonusTotal();
        this.setHP();
    }

    setExtras() {
        if (this.data.data.bonus.stats === undefined) {
            this.data.data.bonus.stats = {};
        }
        const {misc, stats} = this.data.data.bonus;
        stats.poison = (misc.trauma || 0) * 2;
    }

    setHP() {
        super.setHP();
        const {bonus, hp} = this.data.data;
        const tenacity = Math.ceil(hp.max * bonus.total.tenacityCf || 0);
        delete hp.tenacity;
        if (tenacity > 0) { hp.tenacity = tenacity; }
    }
}
