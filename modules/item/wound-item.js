import { HMDialogFactory } from '../dialog/dialog-factory.js';
import { HMItem } from './item.js';
import { HMCONST } from '../tables/constants.js';

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

    static async addWound(notify, context, wdata) {
        const woundData = wdata ?? (await HMDialogFactory({dialog: 'wound'})).resp;
        const {hp, assn, armorDamage, embed, isEmbedded, note} = woundData;

        if (armorDamage) {
            const armor = context.itemTypes.armor.find((a) => (
                a.system.state === HMCONST.ITEM_STATE.EQUIPPED
                && !a.system.isShield
            ));
            if (armor) armor.damageArmorBy(armorDamage);
        }

        if (!hp) return;

        const system = {hp, timer: hp, embed, isEmbedded, note};
        const itemData = {name: 'Wound', type: 'wound', system};
        await Item.create(itemData, {parent: context});

        if (notify) {
            ui.notifications.info(`<b>${context.name}</b> receives <b>${hp}</b> HP of damage.`);
        }

        const hpTrauma = context.system.hp.top;
        const hpTenacity = context.system.hp.tenacity;
        const traumaCheck = hpTrauma < (hp + assn);
        const tenacityCheck = hpTenacity < hp;

        context.onWound(traumaCheck, tenacityCheck);
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
                system.treated = true;
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
