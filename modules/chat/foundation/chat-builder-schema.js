export class BuilderSchema extends foundry.abstract.DataModel {
    static defineSchema() {
        const { fields } = foundry.data;
        const datasetOpts = {
            required: false,
            initial: undefined,
            readonly: false,
        };

        /**
         * @param {string} caller - Uuid for the actor the chat pertains to.
         * @param {string} context - Uuid for the item the chat pertains to.
         * @param {Object} roll - Json data for a dice roll the chat pertains to.
         * @param {Object} resp - Data polled from the user from an Application.
         * @param {Object} mdata - Details for chat card enrichment.
         * @param {Object[]} batch - Bulk object data for batch processing.
         * @param {Object} options - Options passed directly to ChatMessage.create().
         */
        return {
            caller: new fields.DocumentUUIDField(datasetOpts),
            context: new fields.DocumentUUIDField(datasetOpts),
            roll: new fields.ObjectField(datasetOpts),
            resp: new fields.ObjectField(datasetOpts),
            mdata: new fields.ObjectField(datasetOpts),
            batch: new fields.ArrayField(new fields.ObjectField(), datasetOpts),
            options: new fields.ObjectField(),
        };
    }
}
