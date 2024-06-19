import { ChatBuilder } from './chat-builder-abstract.js';
import { HMCONST } from '../tables/constants.js';

const failType = HMCONST.TRAUMA_FAILSTATE;

export class TraumaCheckChatBuilder extends ChatBuilder {
    static template = 'systems/hackmaster5e/templates/chat/trauma.hbs';

    async createChatMessage() {
        const {batch, resp} = this.data;
        let {mdata} = this.data;
        const [traumaRoll, , durationRoll] = batch;
        const {failState} = mdata;

        const rFlavor = ['Trauma Check', 'Coma Check', 'Extended Duration'];
        const rollContent = await Promise.all(batch.map((r, i) => r.render({flavor: rFlavor[i]})));

        mdata.duration = ({
            [failType.FAILED]: traumaRoll.total * 5,
            [failType.KO]: durationRoll?.total,
            [failType.COMA]: durationRoll?.total,
            [failType.VEGETABLE]: 'Indefinite',
        })[failState];

        mdata = {...mdata, ...this.getResultData(failState)};

        const resultString = ChatBuilder.getResult(mdata.rv);
        const chatData = {resultString, rollContent, mdata, resp};

        const content = await renderTemplate(this.template, chatData);

        const chatMessageData = this.getChatMessageData({content});
        await ChatMessage.create(chatMessageData);
    }

    getResultData(idx) {
        return ({
            [failType.PASSED]: {
                rv: this.RESULT_TYPE.PASSED,
                result: undefined,
                unit: undefined,
            },
            [failType.FAILED]: {
                rv: this.RESULT_TYPE.FAILED,
                result: 'Incapacitated',
                unit: 'seconds',
            },
            [failType.KO]: {
                rv: this.RESULT_TYPE.CRITFAIL,
                result: 'Knock-Out',
                unit: 'minutes',
            },
            [failType.COMA]: {
                rv: this.RESULT_TYPE.DCRITFAIL,
                result: 'Coma',
                unit: 'days',
            },
            [failType.VEGETABLE]: {
                rv: this.RESULT_TYPE.GOODBYE,
                result: 'Coma',
                unit: undefined,
            },
        })[idx];
    }
}
