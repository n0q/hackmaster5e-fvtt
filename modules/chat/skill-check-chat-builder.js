import { ChatBuilder } from './chat-builder-abstract.js';
import { HMCONST, HMTABLES } from '../tables/constants.js';

export class SkillCheckChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/skill.hbs';

    async createChatMessage() {
        const {resp, roll} = this.data;
        const {dc, formulaType} = resp;
        const {SKILL} = HMCONST;

        const mdata = this.getMetadata(formulaType, dc);
        const rolls = [roll];
        const rollContent = await roll.render({flavor: mdata.rollFlavor});

        let result = this.RESULT_TYPE.FAILED;
        const rollIndex = HMTABLES.skill.difficulty(roll.total);
        const NOT_FOUND = -1;

        if (formulaType !== SKILL.TYPE.OPPOSED && rollIndex !== NOT_FOUND) {
            if (dc === SKILL.DIFF.AUTO) {
                result = this.RESULT_TYPE[`SKILL${rollIndex}`];
            } else if (dc >= rollIndex) {
                result = this.RESULT_TYPE.PASSED;
            }
        }

        const resultString = ChatBuilder.getResult(result);

        const chatData = {rollContent, mdata, resultString};
        const content = await renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({content, rolls, resp});
        await ChatMessage.create(chatMessageData);
    }

    /**
     * Returns mdata for skill card template.
     * @param {number} type - Formula type to generate mdata for.
     * @return {object}
     */
    getMetadata(type, dc) {
        const {specname, system} = this.data.context;
        const {level, mastery} = system;

        const getLevelAndMastery = (k) => ({
            level: level[k] ?? 0,
            mastery: mastery[k] ?? 0,
        });

        const {TYPE} = HMCONST.SKILL;
        const mdataMapping = {
            [TYPE.SKILL]: {rollFlavor: 'Skill Check', ...getLevelAndMastery('value')},
            [TYPE.OPPOSED]: {rollFlavor: 'Opposed Skill Check', ...getLevelAndMastery('value')},
            [TYPE.VERBAL]: {rollFlavor: 'Verbal Check', ...getLevelAndMastery('verbal')},
            [TYPE.WRITTEN]: {rollFlavor: 'Literacy Check', ...getLevelAndMastery('literacy')},
        };
        return {type, specname, dc, ...mdataMapping[type] };
    }
}
