/** Preset units for the line-item combobox. */
export const UNIT_PRESETS = [
	'hour',
	'day',
	'item',
	'licence',
	'milestone',
	'month',
	'word',
	'page'
] as const;

const RATE_ABBREV: Record<string, string> = {
	hour: 'hr',
	day: 'day',
	item: 'item',
	licence: 'licence',
	milestone: 'milestone',
	month: 'mo',
	word: 'word',
	page: 'page'
};

const IRREGULAR_PLURALS: Record<string, string> = {
	hour: 'hours',
	day: 'days',
	item: 'items',
	licence: 'licences',
	milestone: 'milestones',
	month: 'months',
	word: 'words',
	page: 'pages'
};

export function pluralizeUnit(unit: string, qty: number): string {
	const trimmed = unit.trim();
	if (!trimmed) return '';
	if (qty === 1) return trimmed;
	const lower = trimmed.toLowerCase();
	if (IRREGULAR_PLURALS[lower]) {
		// Preserve original casing style for presets typed lowercase
		return IRREGULAR_PLURALS[lower];
	}
	if (/s$/i.test(trimmed)) return trimmed;
	return `${trimmed}s`;
}

export function unitRateAbbrev(unit: string): string {
	const lower = unit.trim().toLowerCase();
	return RATE_ABBREV[lower] ?? unit.trim();
}

/** e.g. `8 hours @ $5.00/hr` */
export function formatQtyAtRate(
	qty: number,
	unit: string,
	price: number,
	currencySymbol: string
): string {
	const unitLabel = pluralizeUnit(unit, qty);
	const abbrev = unitRateAbbrev(unit);
	return `${qty} ${unitLabel} @ ${currencySymbol}${price.toFixed(2)}/${abbrev}`;
}
