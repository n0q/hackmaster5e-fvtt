/**
 * @typedef {object} HMUnit - Represents a stat unit.
 * @property {number} value - The value of this unit.
 * @property {string} unit - Individual stat name ("dr", "init", etc)
 * @property {string} vector - Vector this stat belongs to ("armor", "race", etc)
 * @property {string} label - A human-readable label for the unit.
 * @property {string} uuid - UUID of the owning document.
 * @property {string} path - Storage pathway information retrieval and updates.
 * @property {string} sourceType - Document type the unit came from.
 */

/**
 * Creates a new stat unit.
 *
 * @param {object} params - Configuration object for the unit.
 * @param {number} params.value - The value of this unit.
 * @param {string} params.unit - Individual stat name ("dr", "init", etc)
 * @param {string} params.vector - Vector this stat belongs to ("armor", "race", etc)
 * @param {string|HMActor|HMItem} params.source - The source document or uuid the unit came from.
 * @param {string} [params.label] - A human-readable label for the unit.
 * @param {string|null} [params.path] - Storage pathway for retrieval and updates. Pass null for no path.
 */
export class HMUnit {
    constructor({ value, unit, vector, source, label, path } = {}) {
        this.value = value;
        this.unit = unit;
        this.vector = vector;
        this.label = label || unit;
        this.uuid = typeof source === "string" ? source : source?.uuid;

        const defaultPath = vector && unit ? `system.bonus.${vector}.${unit}` : null;
        this.path = path !== undefined ? path : defaultPath;

        this.sourceType = typeof source === "string"
            ? source.split(".")[0]
            : source?.documentName;
    }

    /** @returns {number} The numeric value for arithmetic use. */
    valueOf() {
        return this.value;
    }

    /** @returns {number} The numeric value for arithmetic use. This method is for clarity. */
    getValue() {
        return this.value;
    }

    /** @returns {HMUnit} Returns a new unit with an updated value. */
    withValue(newValue) {
        const source = this.uuid;
        return new HMUnit({
            value: newValue,
            unit: this.unit,
            vector: this.vector,
            source,
            label: this.label,
            path: this.path
        });
    }

    /**
     * Add another value or HMUnit to this unit and return a new one.
     * @param {number|HMUnit} other - The value or unit to add.
     * @returns {HMUnit}
     */
    add(other) {
        return this.withValue(this.value + Number(other));
    }

    /** @returns {string} A human-readable string representation. */
    toString() {
        return `${this.value} (${this.label})`;
    }
}
