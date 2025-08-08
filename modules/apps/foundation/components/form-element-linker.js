/**
 * Utility class for managing dependencies between form elements.
 * Handles linking element states (like checkbox controlling another element's disabled state).
 */
export class FormElementLinker {
    #listeners = new Map(); // Private registry of source elements -> listener functions

    /**
     * Creates a new FormElementLinker instance.
     * @param {HTMLElement} element - The parent element containing the form elements
     * @param {Object[]} links - Array of link configurations
     * @param {string} links[].source - Selector for the source element
     * @param {string} links[].target - Selector for the target element(s)
     * @param {string} [links[].sourceProperty='checked'] - Property to read from source
     * @param {string} [links[].targetProperty='disabled'] - Property to set on target
     * @param {Function} [links[].transform] - Optional transform function for the value
     */
    constructor(element, links = []) {
        this.element = element;
        this.links = links;
        this._bindLinks();
    }

    /**
     * Binds all configured links and sets up event listeners.
     * @private
     */
    _bindLinks() {
        for (const link of this.links) {
            this._bindLink(link);
        }
    }

    /**
     * Binds a single link and sets up its event listener.
     * @private
     * @param {Object} link - Link configuration
     */
    _bindLink(link) {
        const source = this.element.querySelector(link.source);
        if (!source) return;

        // Set initial state
        this._updateLink(link);

        // Only add listener if we haven't already for this source element
        if (!this.#listeners.has(source)) {
            const eventType = this._getEventType(source);
            const listener = () => this._updateLinksForSource(source);
            source.addEventListener(eventType, listener);
            this.#listeners.set(source, listener);
        }
    }

    /**
     * Updates all links that use a specific source element.
     * @private
     * @param {HTMLElement} source - The source element that changed
     */
    _updateLinksForSource(source) {
        for (const link of this.links) {
            const linkSource = this.element.querySelector(link.source);
            if (linkSource === source) {
                this._updateLink(link);
            }
        }
    }

    /**
     * Updates a single link based on its configuration.
     * @private
     * @param {Object} link - Link configuration
     */
    _updateLink(link) {
        const source = this.element.querySelector(link.source);
        const targets = this.element.querySelectorAll(link.target);

        if (!source || !targets.length) return;

        const sourceProperty = link.sourceProperty || "checked";
        const targetProperty = link.targetProperty || "disabled";

        let value = source[sourceProperty];

        // Apply transform if provided
        if (link.transform) {
            value = link.transform(value, source);
        }

        // Update all matching targets
        targets.forEach(target => {
            target[targetProperty] = value;
        });
    }

    /**
     * Determines the appropriate event type for an element.
     * @private
     * @param {HTMLElement} element - The element to check
     * @returns {string} The event type to listen for
     */
    _getEventType(element) {
        if (element.type === "checkbox" || element.type === "radio") {
            return "change";
        }
        return "input";
    }

    /**
     * Manually trigger an update for all links.
     */
    update() {
        for (const link of this.links) {
            this._updateLink(link);
        }
    }

    /**
     * Add a new link dynamically.
     * @param {Object} link - Link configuration
     */
    addLink(link) {
        this.links.push(link);
        this._bindLink(link);
    }

    /**
     * Remove a link and clean up if necessary.
     * @param {Object|number} linkOrIndex - The link object or its index
     */
    removeLink(linkOrIndex) {
        const index = typeof linkOrIndex === "number"
            ? linkOrIndex
            : this.links.indexOf(linkOrIndex);

        if (index === -1) return;

        const [removedLink] = this.links.splice(index, 1);

        // Check if any remaining links use the same source
        const source = this.element.querySelector(removedLink.source);
        if (source) {
            const stillUsed = this.links.some(link => {
                const linkSource = this.element.querySelector(link.source);
                return linkSource === source;
            });

            // If no other links use this source, remove its listener
            if (!stillUsed && this.#listeners.has(source)) {
                const listener = this.#listeners.get(source);
                const eventType = this._getEventType(source);
                source.removeEventListener(eventType, listener);
                this.#listeners.delete(source);
            }
        }
    }

    /**
     * Remove all listeners and clean up.
     * Call this before destroying the component or when the form is being removed.
     */
    destroy() {
        for (const [source, listener] of this.#listeners) {
            const eventType = this._getEventType(source);
            source.removeEventListener(eventType, listener);
        }
        this.#listeners.clear();
        this.links = [];
    }

    /**
     * Replace all links with a new set.
     * More efficient than destroying and recreating the component.
     * @param {Object[]} newLinks - New array of link configurations
     */
    replaceLinks(newLinks) {
        this.destroy(); // Clean up all existing listeners
        this.links = newLinks;
        this._bindLinks();
    }
}
