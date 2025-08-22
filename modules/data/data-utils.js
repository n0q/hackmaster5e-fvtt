/**
 * Validates that a string conforms to the basic object binding format.
 *
 * The required format is `type:name` or `type:name_subname`.
 * It must contain only lowercase letters (a-z), numbers (0-9), and hyphens (-).
 * The optional 'subcategory' must be separated by a single underscore (_).
 *
 * @param {string} str - The bob string to validate.
 * @param {string} bobType - Optional type restriction.
 * @returns {boolean} True is str is valid. False if not.
 */
export function isValidBasicObjectBinding(str, expectedType = undefined) {
    if (expectedType) {
        const [actualType, _] = str.split(":");
        if (expectedType !== actualType) return false;
    }
    return /^[a-z0-9-]+:[a-z0-9-]+(?:_[a-z0-9-]+)?$/.test(str);
}

/**
 * Sanitizes a string for use in a basic object binding.
 * - Converts to lowercase.
 * - Replaces underscores and whitespace with hyphens.
 * - Removes all other special characters.
 * - Collapses multiple hyphens into one.
 * - Trims hyphens from start/end.
 *
 * @param {string} str - The string to sanitize.
 * @returns {string} The sanitized string.
 */
export function sanitizeForBasicObjectBinding(str) {
    if (!str) return "";

    return str
        .toLowerCase()                     // Convert to lowercase
        .replace(/[_\s]+/g, "-")           // Replace underscores and whitespace with hyphens
        .replace(/[^a-z0-9-]/g, "")        // Remove all other special characters
        .replace(/-+/g, "-")               // Collapse multiple hyphens into one
        .replace(/^-|-$/g, "");            // Trim hyphens from start/end
}

/**
 * Validates that a value is a Map instance.
 *
 * @param {*} value - The value to validate.
 * @returns {boolean} True if value is a Map instance.
 */
export function isValidMap(value) {
    return value instanceof Map;
}
