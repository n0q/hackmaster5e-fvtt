import { HMItem } from './item.js';

export class HMWoundItem extends HMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    onClick(ev) {
        this.WoundAction(ev);
    }

    async setHp({value=0, isDelta=true}={}) {
        let {hp, timer} = this.system;
        hp = isDelta ? hp + value : value;
        timer = hp;
        await this.update({'system': {hp, timer}});
    }

    async setTimer({value=0, isDelta=true}={}) {
        let {hp, timer} = this.system;
        timer = isDelta ? timer + value : value;
        if (timer < 1) timer = --hp;
        await this.update({'system': {hp, timer}});
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const {action} = element.dataset;

        if (action === 'decTimer') await this.setTimer({value: -1});
        if (action === 'decHp') await this.setHp({value: -1});
        if (this.system.hp < 0) this.delete();
    }
}
