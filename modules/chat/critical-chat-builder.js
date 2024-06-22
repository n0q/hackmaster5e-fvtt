import { ChatBuilder } from './chat-builder-abstract.js';
import { SYSTEM_ID } from '../tables/constants.js';
import { CRITTABLE } from '../tables/crits.js';
import { idx } from '../tables/dictionary.js';

export class CriticalChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/crit.hbs';

    async createChatMessage() {
        const {resp, roll} = this.data;
        if (Object.keys(roll).length === 0) {
            const badcrit = game.i18n.localize('HM.CHAT.STRING.badcrit');
            ui.notifications.info(badcrit);
            return;
        }

        const critHitString = game.i18n.localize('HM.chatCard.critHit');
        const dmgTypeString = game.i18n.localize(idx.dmgType[resp.dmgType]);
        const rollFlavor = `${critHitString} (${dmgTypeString})`;
        const rollContent = await roll.render({flavor: rollFlavor});

        const rollIdx = CRITTABLE.rollIdx.findIndex((x) => x >= roll.total);
        const sevIdx = CRITTABLE.sevIdx.findIndex((x) => x >= resp.severity);
        const mdata = {
            result: CRITTABLE[rollIdx][resp.dmgType][sevIdx],
            location: CRITTABLE[rollIdx].label,
            side: roll.total % 2,
        };

        const useArmorDegredation = game.settings.get(SYSTEM_ID, 'armorDegredation');
        if (useArmorDegredation) Hooks.callAll('armorDamage', 1, game.user.id);

        const chatData = {rollContent, mdata, resp};
        const content = await renderTemplate(this.template, chatData);
        const chatMessageData = this.getChatMessageData({content});
        await ChatMessage.create(chatMessageData);
    }
}
