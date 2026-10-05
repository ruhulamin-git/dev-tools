/** Country → Tax ID field label. Extend as needed. */
const TAX_ID_LABELS: Record<string, string> = {
	Bangladesh: 'BIN',
	'United Kingdom': 'VAT Number',
	India: 'GSTIN',
	'United States': 'EIN',
	Australia: 'ABN'
};

/** EU member states (and common aliases in COUNTRIES) that use VAT Number. */
const EU_VAT_COUNTRIES = new Set([
	'Austria',
	'Belgium',
	'Bulgaria',
	'Croatia',
	'Cyprus',
	'Czech Republic',
	'Denmark',
	'Estonia',
	'Finland',
	'France',
	'Germany',
	'Greece',
	'Hungary',
	'Ireland',
	'Italy',
	'Latvia',
	'Lithuania',
	'Luxembourg',
	'Malta',
	'Netherlands',
	'Poland',
	'Portugal',
	'Romania',
	'Slovakia',
	'Slovenia',
	'Spain',
	'Sweden'
]);

export function getTaxIdLabel(country: string | undefined | null): string {
	if (!country) return 'Tax ID';
	if (TAX_ID_LABELS[country]) return TAX_ID_LABELS[country];
	if (EU_VAT_COUNTRIES.has(country)) return 'VAT Number';
	return 'Tax ID';
}
