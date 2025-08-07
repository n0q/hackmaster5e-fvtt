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
