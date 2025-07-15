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

        await context.onWound(traumaCheck, tenacityCheck);
    }

    async WoundAction(event) {
        const element = event.currentTarget;
        const {action} = element.dataset;
        let {hp, isEmbedded, timer, treated} = this.system;

        switch (action) {
            case 'decTimer': {
                timer--;
                if (!timer && hp) timer = --hp;
                treated = true;
                break;
            }
            case 'decHp': {
                hp = Math.max(0, hp - 1);
                const limit = Math.sign(hp);
                timer = Math.max(limit, --timer);
                treated = true;
                break;
            }
            case 'treat': {
                treated = !treated;
                break;
            }
            case 'toggleEmbed': {
                isEmbedded = !isEmbedded;
                treated = true;
            }
            // no default
        }

        if (hp < 1) [hp, timer] = [0, 0];

        const updateData = {
            'system.hp': hp,
            'system.isEmbedded': isEmbedded,
            'system.timer': timer,
            'system.treated': treated,
        };

        hp < 1 && !isEmbedded
            ? await this.delete()
            : await this.update(updateData);
    }
}
