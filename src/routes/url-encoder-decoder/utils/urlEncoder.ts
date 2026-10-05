/**
 * Encodes a string to URL-encoded format (percent-encoding)
 */
export function encodeUrl(input: string): string {
    if (!input) return '';
    try {
        return encodeURIComponent(input);
    } catch (error) {
        console.error('Error encoding URL:', error);
        return input;
    }
}

/**
 * Decodes a URL-encoded string back to its original form
 */
export function decodeUrl(input: string): string {
    if (!input) return '';
    try {
        const normalized = input.replace(/\+/g, '%20');
        return decodeURIComponent(normalized);
    } catch (error) {
        console.error('Error decoding URL:', error);
        return input;
    }
}

/**
 * Validates if a string is properly URL-encoded
 */
export function isValidUrlEncoded(input: string): boolean {
    if (!input) return true;
    try {
        decodeURIComponent(input.replace(/\+/g, '%20'));
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks if a string contains URL-encoded characters
 */
export function hasEncodedCharacters(input: string): boolean {
    return /%[0-9A-Fa-f]{2}/.test(input) || input.includes('+');
}
