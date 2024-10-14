import { ChatBuilder } from './chat-builder-abstract.js';
import { HMCONST } from '../tables/constants.js';

export class DefenseChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/chat-defend.hbs';

    async createChatMessage() {
        const {caller, context, resp, roll} = this.data;
        const mdata = {dr: caller.drObj};

        const sumDice = ChatBuilder.getDiceSum(roll);

        let result = this.RESULT_TYPE.NONE;
        if (sumDice >=  20) { result = this.RESULT_TYPE.PERFECT;      } else
        if (sumDice === 19) { result = this.RESULT_TYPE.NEAR_PERFECT; } else
        if (sumDice === 18) { result = this.RESULT_TYPE.SUPERIOR;     } else
        if (sumDice === 1)  { result = this.RESULT_TYPE.FUMBLE;       }
        const resultString = ChatBuilder.getResult(result);

        const flavor = game.i18n.localize('HM.CHAT.def') + getRollFlavor(resp);
        const rollContent = await roll.render({flavor});

        const chatData = {context, mdata, resultString, rollContent};
        const content = await renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({content, resp});
        await ChatMessage.create(chatMessageData);
    }
}

function getRollFlavor(resp) {
    const mods = [];
    const {specialMove} = resp;
    const {SPECIAL} = HMCONST;
    if (specialMove === SPECIAL.FLEEING) mods.push(game.i18n.localize('HM.fleeing'));
    if (specialMove === SPECIAL.GGROUND) mods.push(game.i18n.localize('EFFECT.gground'));
    if (specialMove === SPECIAL.RDEFEND) mods.push(game.i18n.localize('HM.ranged'));
    if (specialMove === SPECIAL.SCAMPER) mods.push(game.i18n.localize('EFFECT.scamper'));
    if (specialMove === SPECIAL.SET4CHARGE) mods.push(game.i18n.localize('HM.specSelect.s4c'));
    if (resp.dodge) mods.push(game.i18n.localize('HM.dodged'));
    return mods.length ? ` (${mods.join(', ')})` : '';
}
