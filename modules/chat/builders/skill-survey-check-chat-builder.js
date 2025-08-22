import { ChatBuilder } from "../foundation/chat-builder-abstract.js";
import { getResult } from "../foundation/chat-builder-constants.js";
import { typeToRollFlavorMap } from "./skill-check-chat-builder.js";
import { getSpeaker } from "../../sys/utils.js";
import { systemPath, HMCONST } from "../../tables/constants.js";

export class SkillSurveyCheckChatBuilder extends ChatBuilder {
    static template = systemPath("templates/chat/chat-skill-survey.hbs");

    async createChatMessage() {
        const processedBatch = this.#processBatchData();
        window.processedBatch = processedBatch;
        if (!this.data.batch || this.data.batch.length === 0) {
            console.warn("BatchSkillCheckChatBuilder: No batch data available");
            return;
        }

        const firstEntry = this.data.batch[0];
        const { resp } = firstEntry;
        const label = typeToRollFlavorMap[resp.masteryType];
        const specname = firstEntry.mdata?.name || "Unknown Skill";
        const flavor = `${specname} ${label}`;

        const chatData = { processedBatch, flavor, specname };
        const content = await this.renderTemplate(this.template, chatData);
        const chatMessageData = this.getChatMessageData({ content });

        await this.render(chatMessageData);
    }

    #processBatchData() {
        const batchData = this.data.batch;

        return batchData.map(obj => {
            const activeTokens = obj.caller.getActiveTokens();
            const tokenName = activeTokens.length > 0
                ? activeTokens[0].name
                : obj.caller.prototypeToken.name || obj.caller.name;
            const speaker = getSpeaker(obj.caller);
            const resultData = this.#getResultData(obj.mdata, obj.resp);
            const rawSuccess = getResult(resultData);
            const success = rawSuccess.replace(/ Success$/, "");
            const opposed = obj.mdata.opposedResult;

            return {
                name: tokenName,
                success,
                opposed,
                speaker,
            };
        });
    }

    async _prepareBatchData(batchData) {
        if (!batchData) return [];
        if (!Array.isArray(batchData)) return [];

        return await Promise.all(
            batchData.map(async obj => ({
                caller: typeof obj.caller === "string" ? await fromUuid(obj.caller) : obj.caller,
                context: typeof obj.context === "string" ? await fromUuid(obj.context) : obj.context,
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
