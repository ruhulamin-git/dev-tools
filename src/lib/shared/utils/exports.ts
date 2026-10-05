// Export utility functions

export function exportToJSON(data: Record<string, unknown>[]): string {
	return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: Record<string, unknown>[]): string {
	if (data.length === 0) return '';

	// Get headers
	const headers = Object.keys(data[0]);

	// Create CSV rows
	const rows = data.map((row) => {
		return headers.map((header) => {
			const value = row[header];
			// Escape quotes and wrap in quotes if contains comma, quote, or newline
			if (value === null || value === undefined) return '';
			const stringValue = String(value);
			if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
				return `"${stringValue.replace(/"/g, '""')}"`;
			}
			return stringValue;
		});
	});

	// Combine headers and rows
	const csvRows = [headers.join(','), ...rows.map((row) => row.join(','))];
	return csvRows.join('\n');
}

export function exportToSQL(
	data: Record<string, unknown>[],
	tableName: string = 'test_data'
): string {
	if (data.length === 0) return '';

	const headers = Object.keys(data[0]);
	const sqlStatements: string[] = [];

	for (const row of data) {
		const values = headers.map((header) => {
			const value = row[header];
			if (value === null || value === undefined) return 'NULL';
			if (typeof value === 'string') {
				return `'${value.replace(/'/g, "''")}'`;
			}
			if (typeof value === 'boolean') {
				return value ? '1' : '0';
			}
			return String(value);
		});

		sqlStatements.push(
			`INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values.join(', ')});`
		);
	}

	return sqlStatements.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
	return navigator.clipboard.writeText(text);
}