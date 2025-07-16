import { ChatBuilder } from './chat-builder-abstract.js';
import { HMTABLES } from '../tables/constants.js';

export class SpellChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/chat-spell.hbs';

    async createChatMessage() {
        const { context, mdata, resp, roll } = this.data;

        foundry.utils.mergeObject(mdata, this.getMetadata());
        if (roll) mdata.inline = unescape(roll);

        const templateData = { context, mdata, roll, resp };
        const content = await ChatBuilder.handlebars.renderTemplate(this.template, templateData);

        const chatData = { content, resp };
        if (mdata.isNPC) {
            chatData.whisper = ChatBuilder.getGMs;
            chatData.rollMode = CONST.DICE_ROLL_MODES.PRIVATE;
        }

        // const chatMessageData = this.getChatMessageData({content, resp, whisper});
        const chatMessageData = this.getChatMessageData(chatData);
        await ChatMessage.create(chatMessageData);
    }

    getMetadata() {
        const mdata = {};
        const { system } = this.data.context;
        mdata.components = getComponentsString(system.component);

        const sLevel = game.i18n.localize(`HM.spellLevels.${system.lidx}`);
        const sType = system.divine
            ? game.i18n.localize('HM.CHAT.cspell')
            : game.i18n.localize('HM.CHAT.mspell');
        mdata.rollFlavor = `${sLevel} ${game.i18n.localize('HM.level')} ${sType}`;

        mdata.check = this.getSpellChecks();
        return mdata;
    }

    getSpellChecks() {
        const { caller, resp, roll } = this.data;

        if (!roll) return undefined;
        const { bonus } = caller.system;

        const formula = HMTABLES.formula.spell;
        const baseroll = roll.total || 0;
        const evalData = { baseroll, bonus };

        const check = {
            save: Roll.safeEval(Roll.replaceFormulaData(formula.save, evalData)),
            sfc: Roll.safeEval(Roll.replaceFormulaData(formula.sfc, evalData)),
        };

        check.mishap = HMTABLES.spell.mishap(resp.sfc, resp.smc, check.sfc);

        return check;
    }
}

function getComponentsString(component) {
    const cList = [];
    if (component.verbal) cList.push('V');
    if (component.somatic) cList.push('S');
    if (component.material) cList.push('M');
    if (component.catalyst) cList.push('C');
    if (component.divine) cList.push('DI');
    return cList.join(', ');
}
