export class CalculatorAbstract {
    /**
     * @param {...any} args - Arguments passed to the parent constructor.
     * @throws {Error} Throws if instantiated directly.
     */
    constructor(data, _options) {
        if (new.target === CalculatorAbstract) {
            throw new Error("CalculatorAbstract cannot be instantiated directly.");
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

    static async calculate(data, options) {
        const calculator = new this(data, options);
        return await calculator.run();
    }

    async run() {
        throw new Error(`'${this.constructor.name}' must implement the 'run' method.`);
    }
}
