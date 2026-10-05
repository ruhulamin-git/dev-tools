export interface JsonValidationResult {
	isValid: boolean;
	error?: {
		message: string;
		line?: number;
		column?: number;
	};
	parsed?: unknown;
}

export function validateJson(input: string): JsonValidationResult {
	if (!input.trim()) {
		return { isValid: false, error: { message: 'Input is empty' } };
	}

	try {
		const parsed = JSON.parse(input);
		return { isValid: true, parsed };
	} catch (e) {
		const error = e as SyntaxError;
		const match = error.message.match(/at position (\d+)/);
		let line: number | undefined;
		let column: number | undefined;

		if (match) {
			const position = parseInt(match[1], 10);
			const lines = input.substring(0, position).split('\n');
			line = lines.length;
			column = lines[lines.length - 1].length + 1;
		}

		return {
			isValid: false,
			error: {
				message: error.message,
				line,
				column
			}
		};
	}
}

export function formatJson(input: string, indent: number = 2): string {
	const result = validateJson(input);
	if (!result.isValid || result.parsed === undefined) {
		throw new Error(result.error?.message || 'Invalid JSON');
	}
	return JSON.stringify(result.parsed, null, indent);
}

export function minifyJson(input: string): string {
	const result = validateJson(input);
	if (!result.isValid || result.parsed === undefined) {
		throw new Error(result.error?.message || 'Invalid JSON');
	}
	return JSON.stringify(result.parsed);
}
