export interface JsonStats {
	keys: number;
	values: number;
	depth: number;
	arrays: number;
	objects: number;
	strings: number;
	numbers: number;
	booleans: number;
	nulls: number;
}

export function getJsonStats(data: unknown): JsonStats {
	const stats: JsonStats = {
		keys: 0,
		values: 0,
		depth: 0,
		arrays: 0,
		objects: 0,
		strings: 0,
		numbers: 0,
		booleans: 0,
		nulls: 0
	};

	function traverse(value: unknown, currentDepth: number): void {
		stats.depth = Math.max(stats.depth, currentDepth);

		if (value === null) {
			stats.nulls++;
			stats.values++;
		} else if (Array.isArray(value)) {
			stats.arrays++;
			value.forEach((item) => traverse(item, currentDepth + 1));
		} else if (typeof value === 'object') {
			stats.objects++;
			const keys = Object.keys(value as object);
			stats.keys += keys.length;
			keys.forEach((key) => traverse((value as Record<string, unknown>)[key], currentDepth + 1));
		} else if (typeof value === 'string') {
			stats.strings++;
			stats.values++;
		} else if (typeof value === 'number') {
			stats.numbers++;
			stats.values++;
		} else if (typeof value === 'boolean') {
			stats.booleans++;
			stats.values++;
		}
	}

	traverse(data, 0);
	return stats;
}
