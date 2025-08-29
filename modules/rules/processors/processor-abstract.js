/**
 * @file Temporary processor pattern for rules processing.
 *
 * This is an interim solution while the aggregator system is being completed.
 * These processors are essentially manual dumping grounds for rule logic that will
 * eventually be replaced by a proper event-driven rules bus system. Do not invest
 * heavily in extending or improving this pattern - it is destined for replacement.
 *
 * @abstract
 */
export class ProcessorAbstract {
    /**
     * @param {...any} args - Arguments passed to the parent constructor.
     * @throws {Error} Throws if instantiated directly.
     */
    constructor(data, _options) {
        if (new.target === ProcessorAbstract) {
            throw new Error("ProcessorAbstract cannot be instantiated directly.");
        }

        this.#schema = new this.constructor.SCHEMA_CLASS(data);
    }

    /**
     * Validated data model for this calculation.
     * @type {foundry.abstract.DataModel}
     * @private
     */
    #schema;

    get schema() {
        return this.#schema;
    }

    static async process(data, options) {
        const processor = new this(data, options);
        return await processor.run();
    }

    async run() {
        throw new Error(`'${this.constructor.name}' must implement the 'run' method.`);
    }
}
