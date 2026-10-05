function escapeYamlString(str: string): string {
	// Check if string needs quoting
	if (
		str === '' ||
		/^[#&*!|>@`]/.test(str) ||
		/[:\n\r\t]/.test(str) ||
		/^\d+$/.test(str) ||
		str === 'true' ||
		str === 'false' ||
		str === 'null'
	) {
		// Use single quotes and escape single quotes
		return `'${str.replace(/'/g, "''")}'`;
	}
	return str;
}

function toYaml(value: unknown, indent: number = 0): string {
	const spaces = ' '.repeat(indent);

	if (value === null) {
		return 'null';
	}

	if (value === undefined) {
		return 'null';
	}

	if (typeof value === 'boolean') {
		return value ? 'true' : 'false';
	}

	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'string') {
		return escapeYamlString(value);
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return '[]';
		}

		const items = value.map((item) => {
			const itemYaml = toYaml(item, indent + 2);
			return `${spaces}- ${itemYaml}`;
		});

		return '\n' + items.join('\n');
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length === 0) {
			return '{}';
		}

		const pairs = entries.map(([key, val]) => {
			const keyYaml = escapeYamlString(key);
			const valYaml = toYaml(val, indent + 2);

			if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
				return `${spaces}${keyYaml}:${valYaml}`;
			}

			return `${spaces}${keyYaml}: ${valYaml}`;
		});

		return '\n' + pairs.join('\n');
	}

	return String(value);
}

export function jsonToYaml(data: unknown): string {
	return toYaml(data, 0);
}
