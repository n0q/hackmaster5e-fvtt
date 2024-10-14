import { ChatBuilder } from './chat-builder-abstract.js';
import { HMCONST, HMTABLES } from '../tables/constants.js';

const typeToBonusMap = {
    [HMCONST.SKILL.TYPE.SKILL]: 'value',
    [HMCONST.SKILL.TYPE.VERBAL]: 'verbal',
    [HMCONST.SKILL.TYPE.WRITTEN]: 'literacy',
};

const SKILL = HMCONST.SKILL;

export class SkillCheckChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/chat-skill.hbs';

    async createChatMessage() {
        const {resp, roll} = this.data;
        const {dc, formulaType} = resp;

        const mdata = this.getMetadata(formulaType, dc);
        mdata.bonus = resp.bonus;

        const rolls = [roll];
        const rollContent = await roll.render({flavor: mdata.rollFlavor});

        const skillCheck = this.getSkillChecks();

        let result = this.RESULT_TYPE.FAILED;
        const rollIndex = HMTABLES.skill.difficulty(skillCheck.check);
        const NOT_FOUND = -1;

        if (rollIndex !== NOT_FOUND) {
            if (dc === SKILL.DIFF.AUTO) result = this.RESULT_TYPE[`SKILL${rollIndex}`];
            else if (dc >= rollIndex) result = this.RESULT_TYPE.PASSED;
        }

        const resultString = ChatBuilder.getResult(result);

        const chatData = {rollContent, mdata, resultString, skillCheck};
        const content = await renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({content, rolls, resp});
        await ChatMessage.create(chatMessageData);
    }

    getSkillChecks() {
        const {context, resp, roll} = this.data;
        const {FORM} = SKILL;

        const value = context.system.bonus.total[typeToBonusMap[resp.formulaType]];
        const baseroll = roll.total || 0;

        const evalData = {baseroll, resp, value};
        const formula = HMTABLES.formula.skill;

        return {
            check: Roll.safeEval(Roll.replaceFormulaData(formula[FORM.CHECK], evalData)),
            opposed: Roll.safeEval(Roll.replaceFormulaData(formula[FORM.OPPOSED], evalData)),
        };
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
            [TYPE.VERBAL]: {rollFlavor: 'Language Check', ...getLevelAndMastery('verbal')},
            [TYPE.WRITTEN]: {rollFlavor: 'Literacy Check', ...getLevelAndMastery('literacy')},
        };
        return {type, specname, dc, ...mdataMapping[type] };
    }
}
