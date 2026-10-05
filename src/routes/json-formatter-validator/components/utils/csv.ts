function escapeCsvValue(val: unknown): string {
	if (val === null || val === undefined) return '';

	let strVal: string;

	// Handle Date objects
	if (val instanceof Date) {
		strVal = val.toISOString();
	} else if (typeof val === 'object') {
		strVal = JSON.stringify(val);
	} else {
		strVal = String(val);
	}

	// CSV injection protection (prevents Excel formula injection)
	if (/^[=+\-@\t\r]/.test(strVal)) {
		strVal = "'" + strVal;
	}

	// Escape double quotes
	strVal = strVal.replace(/"/g, '""');

	// Wrap in quotes if contains special characters
	if (/[,\n\r"]/.test(strVal)) {
		return `"${strVal}"`;
	}

	return strVal;
}

function getCsvHeader(keys: string[]): string {
	return keys
		.map((k) => {
			const escapedKey = k.replace(/"/g, '""');
			return /[,\n\r"]/.test(k) ? `"${escapedKey}"` : escapedKey;
		})
		.join(',');
}

function getCsvRow(obj: Record<string, unknown>, keys: string[]): string {
	return keys.map((key) => escapeCsvValue(obj[key])).join(',');
}

export function jsonToCsv(data: unknown, includeBOM: boolean = true): string {
	if (!Array.isArray(data)) {
		if (typeof data === 'object' && data !== null) {
			data = [data];
		} else {
			throw new Error('JSON must be an array or object to convert to CSV');
		}
	}

	const arr = data as Record<string, unknown>[];
	if (arr.length === 0) return '';

	const keys = [...new Set(arr.flatMap((obj) => Object.keys(obj)))];
	const header = getCsvHeader(keys);
	const rows = arr.map((obj) => getCsvRow(obj, keys));

	const csvString = [header, ...rows].join('\n');

	// Add UTF-8 BOM for Excel compatibility
	return includeBOM ? '\uFEFF' + csvString : csvString;
}
