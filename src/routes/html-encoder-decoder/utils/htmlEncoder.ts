/**
 * Encodes special HTML characters into HTML entities
 */
export function encodeHtml(input: string): string {
	if (!input) return '';
	try {
		return input
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	} catch {
		return input;
	}
}

/**
 * Decodes HTML entities back to their original characters
 */
export function decodeHtml(input: string): string {
	if (!input) return '';
	try {
		return input
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&#x27;/g, "'")
			.replace(/&apos;/g, "'");
	} catch {
		return input;
	}
}

/**
 * Checks if a string contains HTML entities
 */
export function hasHtmlEntities(input: string): boolean {
	return /&(?:amp|lt|gt|quot|apos|#39|#x27);/.test(input);
}

export type OperationMode = 'encode' | 'decode';
