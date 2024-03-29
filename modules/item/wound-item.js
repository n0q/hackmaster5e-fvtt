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
                if (!system.timer && system.hp) system.timer = --system.hp;
                system.treated = true;
                break;
            }
            case 'decHp': {
                system.hp = Math.max(0, system.hp - 1);
                const limit = Math.sign(system.hp);
                system.timer = Math.max(limit, --system.timer);
                system.treated = true;
                break;
            }
            case 'treat': {
                system.treated = !system.treated;
                break;
            }
            case 'toggleEmbed': {
                system.isEmbedded = !system.isEmbedded;
            }
            // no default
        }

        if (system.hp < 1) {
            system.hp = 0;
            system.timer = 0;
        }
        system.hp < 1 && !system.isEmbedded ? this.delete() : this.update({system});
    }
}
