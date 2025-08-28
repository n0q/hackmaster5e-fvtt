import { HMUnit } from "./aggregator-unit.js";

/**
 * @typedef {Object} PropagationContext
 * @property {HMAggregator} consumer - The aggregator requesting data.
 * @property {HMAggregator} provider - The aggregator providing data.
 */

export class HMAggregator {
    #units = new Map();

    #parent;

    #parentData;

    #items;

    #label;

    /**
     * Internal aggregator options.
     *
     * @private
     * @type {object}
     * @property {boolean} noprop - If true, this agg will not provide data to consumers.
     * @property {boolean} readonly - If true, this agg is locked after initialization.
     */
    #opts = {
        noprop: true,
        readonly: false,
    };

    #initializing;

    #cache = null;

    #_isDirty = false;

    #_isCalculating = false;

    /**
    * @param {HMActor|HMItem} parent - The parent document this aggregator is operating under.
    * @param {object|DataModel} system - Underlying system data for the parent document.
    *                                    Uses parent.system if undefined.
    * @param {documents.Item[]|Record<string, documents.Item[]>|undefined} items - Items to aggregate from.
    *                                    Uses parent.itemTypes or parent.items if undefined.
    */
    constructor({ parent, label, system, items, skipCollection = false } = {}, opts = {}) {
        this.#parent = parent;
        this.#parentData = system ?? parent?.system;
        this.#label = label ? label : parent?.type || "unknown";
        this.#initializing = !skipCollection;
        foundry.utils.mergeObject(this.#opts, opts);

        if (parent?.itemTypes) {
            this.#items = items ?? parent.itemTypes;
        } else if (parent?.items) {
            this.#items = items ?? parent.items;
        } else {
            this.#items = items;
        }

        if (!skipCollection) {
            this.#collectUnits();
            this.#initializing = false;
        }
    }

    get parent() {
        return this.#parent;
    }

    get isDirty() {
        return this.#_isDirty;
    }

    get isReadOnly() {
        return !!this.#opts?.readonly;
    }

    /**
     * Check if this aggregator should propagate its values to a consumer aggregator.
     *
     * Returns false if the aggregator is set noprop.
     * Otherwise returns this.#parent.canPropagate
     *
     * @param {HMAggregator} consumer - The aggregator requesting data.
     * @returns {boolean} True if propagation is allowed
     */
    canPropagate(consumer = null) {
        if (this.#opts.noprop) return false;

        const propContext = {
            consumer,
            provider: this,
        };

        return this.#parent?.canPropagate?.(propContext) || false;
    }

    get isInitializing() {
        return this.#initializing;
    }

    /**
     * Throws an error if the aggregator is read-only and not initializing.
     *
     * @throws {Error} If #this.isReadOnly && !#this.isInitializing
     */
    assertWritable() {
        if (this.isReadOnly && !this.isInitializing) {
            throw Error("Unable to alter read-only Aggregator.");
        }
    }

    /**
     * Create a HMAggregator from a Map of units.
     * This is useful for reconstructing aggregators from stored data.
     *
     * @param {Map} unitsMap - The Map of units (as returned by toMap())
     * @param {HMActor|HMItem} [parent] - Optional parent document for context
     * @returns {HMAggregator} A new aggregator instance with the provided units
     */
    static fromMap(unitsMap, parent = null) {
        const aggregator = new HMAggregator({
            parent,
            system: parent?.system,
            items: null,
            skipCollection: true,
        }, {
            noprop: true,
            readonly: true,
        });
        aggregator._loadFromMap(unitsMap);
        return aggregator;
    }

    /**
     * Load units from a Map. Used internally by fromMap().
     *
     * @param {Map} unitsMap - The Map to load units from
     * @private
     */
    _loadFromMap(unitsMap) {
        this.#units = unitsMap;
        this.#calculateTotals();
    }

    /**
     * Export the aggregator's units as a Map.
     *
     * @returns {Map<string, HMUnit[]>}
     */
    toMap() {
        return this.#units;
    }

    /**
     * Collects data from parent and embedded items, then calculates total vector.
     *
     * @private
     */
    #collectUnits() {
        this.#collectParentUnits();
        this.#collectItemUnits();
        this.#calculateTotals();
    }

    #collectParentUnits() {
        this.#aggregate(this.#parentData.agg || this.#parentData.bonus, this.#parent);
        if (typeof this.#parent._postAggregation === "function") {
            this.#parent._postAggregation(this);
        }
    }

    #aggregate(bonus, parent) {
        if (!bonus) return;

        for (const [vector, stats] of Object.entries(bonus)) {
            if (vector === "total") continue;
            if (typeof stats !== "object") continue;

            for (const [unit, value] of Object.entries(stats)) {
                if (value == null) continue;
                this.#addUnit(new HMUnit({ value, unit, vector, source: parent }));
            }
        }
    }

    #collectItemUnits() {
        if (!this.#items) return;

        if (Array.isArray(this.#items)) {
            for (const item of this.#items) {
                this.#processItem(item);
            }
        } else if (typeof this.#items === "object") {
            for (const itemArray of Object.values(this.#items)) {
                if (!Array.isArray(itemArray)) continue;
                for (const item of itemArray) {
                    this.#processItem(item);
                }
            }
        }
    }

    /**
     * Process an individual item for collection if the providing
     * aggregator's canPropagate returns as true.
     *
     * NOTE: There's no way this is working, yet.
     *
     * @param {HMItem} item - The item to process.
     * @private
     */
    #processItem(item) {
        if (item.hmagg && !item.hmagg.canPropagate(this)) {
            return;
        }

        if (typeof item.handleBonusAggregation === "function") {
            item.handleBonusAggregation(this);
            return;
        }

        const bonusData = item.system?.agg || item.system?.bonus;
        if (!bonusData) return;

        for (const [vector, stats] of Object.entries(bonusData)) {
            if (vector === "total") continue;
            if (typeof stats !== "object") continue;

            for (const [unit, value] of Object.entries(stats)) {
                if (value == null) continue;
                this.#addUnit(new HMUnit({ value, unit, vector, source: item }));
            }
        }
    }

    /**
     * Add a unit to the aggregator. Used by custom bonus handlers.
     *
     * @param {HMUnit} unit - The unit to add
     */
    addUnit(unit) {
        if (unit.vector === "total") {
            throw new Error("'total' is a reserved vector name.");
        }

        this.assertWritable();
        this.#addUnit(unit);
    }

    /**
     * Add multiple units from an object to the aggregator under a specific vector.
     * Utility method for post-aggregation hooks to easily add calculated bonuses.
     *
     * @param {string} vector - The vector name to add units under
     * @param {object<string, number>} units - Object mapping unit names to values
     * @param {HMActor|HMItem} source - Source document for the units
     * @param {string} label - Base label for the units (unit name will be appended)
     * @param {string|null} [path=null] - Storage path for updates, null for synthetic units
     */
    addVector({ vector, units, source, label, path = null } = {}) {
        for (const [unit, value] of Object.entries(units)) {
            if (value == null) continue;

            const hmUnit = new HMUnit({
                value,
                unit,
                vector,
                source,
                label: `${label} ${unit}`,
                path
            });

            this.addUnit(hmUnit);
        }
    }

    /**
     * Add a unit to the internal collection.
     *
     * @param {HMUnit} unit - The unit to add
     * @private
     */
    #addUnit(unit) {
        if (!unit.vector || !unit.unit) {
            throw new Error("Unit must have both vector and unit properties.");
        }

        if (unit.vector.includes(".") || unit.unit.includes(".")) {
            throw new Error("Vector and unit names cannot contain dots.");
        }

        const key = `${unit.vector}.${unit.unit}`;
        if (!this.#units.has(key)) {
            this.#units.set(key, []);
        }
        this.#units.get(key).push(unit);

        if (null != this.#cache) {
            this.#cache = null;
        }

        this.#_isDirty = true;
    }

    #calculateTotals() {
        if (this.#_isCalculating) {
            console.warn("Preventing recursive calculation in aggregator");
            return;
        }

        this.#_isCalculating = true;

        try {
            const totals = new Map();

            for (const [key, units] of this.#units.entries()) {
                const [vector, unit] = key.split(".");
                const sum = units.reduce((acc, u) => acc + u, 0);

                const totalKey = `total.${unit}`;
                if (!totals.has(totalKey)) {
                    totals.set(totalKey, 0);
                }

                totals.set(totalKey, totals.get(totalKey) + sum);
            }

            for (const [key, value] of totals.entries()) {
                const [, unit] = key.split(".");

                // Check if all contributing units for this stat have null paths
                const contributingUnits = this.getUnitsForStat(unit);
                const allPathsNull = contributingUnits.length > 0
                    && contributingUnits.every(u => u.path === null);

                const hmUnitData = {
                    value,
                    unit,
                    vector: "total",
                    source: this.#parent || null,
                    label: `Total ${unit}`,
                    path: allPathsNull ? null : undefined
                };
                this.#addUnit(new HMUnit(hmUnitData));
            }

            this.#_isDirty = false;
        } finally {
            this.#_isCalculating = false;
        }
    }

    /**
     * Get all units for a specific stat, regardless of vector.
     * Excludes the computed "total" vector.
     *
     * @param {string} unit - The stat name (e.g., "dr", "init")
     * @returns {HMUnit[]} Array of all units contributing to this stat (excluding total)
     */
    getUnitsForStat(unit) {
        const results = [];
        for (const [key, units] of this.#units.entries()) {
            const [vector, unitName] = key.split(".");
            if (unitName === unit && vector !== "total") {
                results.push(...units);
            }
        }
        return results;
    }

    #invalidateCache() {
        this.#cache = null;
        this.#_isDirty = true;
    }

    /**
     * Returns cached vector objects.
     * Caches vector objects if the cache is not populated.
     *
     * @returns {Object<Object<string|number>>}
     */
    get vectors() {
        if (this.#_isCalculating) {
            throw new Error("Cannot access computed vectors during calculation. Use getUnitsForVector() or getUnitsForStat() instead.");
        }

        if (this.isDirty && !this.#_isCalculating) {
            this.#calculateTotals();
        }

        if (!this.#cache) {
            const cache = {};
            for (const [key, units] of this.#units.entries()) {
                const [vector, unit] = key.split(".");
                if (!cache[vector]) cache[vector] = {};
                cache[vector][unit] = units[0]?.value ?? 0;
            }
            this.#cache = foundry.utils.deepFreeze(cache, { strict: true });
        }

        return this.#cache;
    }

    /**
     * Get all units from a specific vector.
     *
     * @param {string} vector - The vector name (e.g., "armor", "race")
     * @returns {HMUnit[]} Array of all units from this vector
     */
    getUnitsForVector(vector) {
        const results = [];
        for (const [key, units] of this.#units.entries()) {
            if (key.startsWith(`${vector}.`)) {
                results.push(...units);
            }
        }
        return results;
    }

    /**
     * Get the total value for a specific stat.
     *
     * @param {string} unit - The stat name (e.g., "dr", "init")
     * @returns {number} The total value for this stat
     */
    getTotal(unit) {
        const totalUnits = this.#units.get(`total.${unit}`);
        if (!totalUnits || totalUnits.length === 0) return 0;
        return totalUnits[0].value; // Total should only have one entry
    }

    /**
     * Get all vector units as a simple object.
     *
     * @param {string} vector - Vector to retrieve.
     * @returns {object<string, number>} Object mapping unit names to vector values.
     */
    getVector(vector) {
        const results = {};
        for (const [key, units] of this.#units.entries()) {
            const [vectorName, unitName] = key.split(".");
            if (vector === vectorName) {
                results[unitName] = units.reduce((sum, u) => sum + u, 0);
            }
        }
        return results;
    }

    /**
     * Get the aggregated total value for a specific stat.
     *
     * @returns {Object} The total vector object with all stat totals
     */
    get total() {
        return this.vectors.total;
    }

    /**
     * Depopulates a vector and all its units.
     * Flags the aggregator as dirty if any action was taken.
     *
     * @param {string} vector - The vector to purge.
     * @throws {Error} If aggregator is read-only.
     */
    deleteVector(vector) {
        this.assertWritable();

        let wasChanged = false;
        for (const [key] of this.#units.entries()) {
            const [unitVector, _] = key.split(".");
            if (unitVector === vector) {
                this.#units.delete(key);
                wasChanged = true;
            }
        }

        if (wasChanged) {
            this.#invalidateCache();
        }
    }

    /**
     * Removes all units for a specific stat, regardless of vector.
     * Flags the aggregator as dirty if any action was taken.
     *
     * @param {string} unit - The stat name to remove (e.g., "def", "dmg").
     * @throws {Error} If aggregator is read-only.
     */
    deleteUnitsByStat(unit) {
        this.assertWritable();

        let wasChanged = false;
        for (const [key] of this.#units.entries()) {
            const [, unitName] = key.split(".");
            if (unitName === unit) {
                this.#units.delete(key);
                wasChanged = true;
            }
        }

        if (wasChanged) {
            this.#invalidateCache();
        }
    }

    /**
     * Force recalculation of totals.
     */
    refresh() {
        this.deleteVector("total");
        this.#calculateTotals();
    }

    /**
     * Propagates this aggregator's total data to the mesh network.
     * Returns an object ready for merging into parent bonus structures.
     *
     * @returns {Object} Object containing this aggregator's total vector, keyed by label
     */
    propagateData() {
        if (!this.canPropagate) return {};
        return { [this.#label]: this.total };
    }
}
