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

    async WoundAction(event) {
        const element = event.currentTarget;
        const {action} = element.dataset;
        const {system} = this;

        switch (action) {
            case 'decTimer': {
                system.timer--;
                if (!system.timer) system.timer = --system.hp;
                break;
            }
            case 'decHp': {
                const limit = Math.sign(--system.hp);
                system.timer = Math.max(limit, --system.timer);
                system.treated = true;
                break;
            }
            // no default
        }
        system.hp < 1 && !system.embed ? this.delete() : this.update({system});
    }
}
