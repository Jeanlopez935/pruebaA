
/**
 * Validates text input to prevent spam and ensure reasonable limits.
 * Rules:
 * 1. Max length check.
 * 2. No double spaces.
 * 3. No leading spaces.
 * 
 * @param text The text to validate
 * @param maxLength Maximum allowed length (default 100)
 * @returns true if valid, false otherwise
 */
export const isValidText = (text: string, maxLength: number = 100): boolean => {
    // 1. Check length
    if (text.length > maxLength) return false;

    // 2. Check for double spaces
    if (/\s\s/.test(text)) return false;

    // 3. Check for leading space
    if (text.startsWith(' ')) return false;

    return true;
};

/**
 * Validates name input (letters and single spaces only).
 * @param text The text to validate
 * @param maxLength Maximum allowed length (default 50)
 * @returns true if valid, false otherwise
 */
export const isValidName = (text: string, maxLength: number = 50): boolean => {
    if (!isValidText(text, maxLength)) return false;

    // Only allow letters and spaces
    // Note: This regex allows empty string (for clearing input)
    return /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(text);
};
