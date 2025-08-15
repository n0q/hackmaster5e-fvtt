import { ChatBuilder } from "../foundation/chat-builder-abstract.js";
import { getResult } from "../foundation/chat-builder-constants.js";
import { typeToRollFlavorMap } from "./skill-check-chat-builder.js";
import { systemPath, HMCONST } from "../../tables/constants.js";

export class BatchSkillCheckChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-skill-batch.hbs");

    async createChatMessage() {
        const processedBatch = this.#processBatchData();
        const { context, resp } = this.data.batch[0];
        const label = typeToRollFlavorMap[resp.masteryType];
        const flavor = `${context.specname} ${label}`;

        const chatData = { processedBatch, flavor };
        const content = await this.renderTemplate(this.template, chatData);
        const chatMessageData = this.getChatMessageData({ content });

        await this.render(chatMessageData);
    }

    #processBatchData() {
        const batchData = this.data.batch;

        return batchData.map(obj => {
            const firstName = obj.caller.name.split(" ")[0];
            const resultData = this.#getResultData(obj.mdata, obj.resp);
            const rawSuccess = getResult(resultData);
            const success = rawSuccess.replace(/\s+\S+$/, "");
            const opposed = obj.mdata.opposedResult;

            return {
                name: firstName,
                success,
                opposed,
            };
        });
    }

    async _prepareBatchData(batchData) {
        return await Promise.all(
            batchData.map(async obj => ({
                caller: await fromUuid(obj.caller),
                context: await fromUuid(obj.context),
                resp: obj.resp,
                mdata: obj.mdata,
                roll: Roll.fromData(obj.roll),
            }))
        );
    }

    #getResultData(mdata, resp) {
        const bestDc = mdata.bestDc;

        if (bestDc === null) {
            return this.RESULT_TYPE.FAILED;
        }

        if (resp.dc === HMCONST.SKILL.DIFF.AUTO) {
            const enumString = `SKILL${bestDc}`;
            return this.RESULT_TYPE[enumString];
        }

        if (resp.dc >= bestDc) {
            return this.RESULT_TYPE.PASSED;
        }

        return this.RESULT_TYPE.FAILED;
    }
}
