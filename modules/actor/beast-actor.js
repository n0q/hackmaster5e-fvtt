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
        const {data} = this.data;
        data.bonus.misc.poison = (data.bonus.misc.trauma || 0) * 2;
    }
}
