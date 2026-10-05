/**
 * Country display names → aliases that may already appear at the end of an address.
 * Used to suppress a duplicate country line on the PDF.
 */
export const COUNTRY_ADDRESS_ALIASES: Record<string, string[]> = {
	'United Kingdom': [
		'united kingdom',
		'uk',
		'u.k.',
		'u.k',
		'gb',
		'great britain',
		'england',
		'scotland',
		'wales'
	],
	'United States': [
		'united states',
		'united states of america',
		'usa',
		'u.s.a.',
		'u.s.a',
		'u.s.',
		'us'
	],
	Bangladesh: ['bangladesh', 'bd'],
	India: ['india', 'in', 'bharat'],
	Australia: ['australia', 'au', 'aus'],
	Canada: ['canada', 'ca'],
	Germany: ['germany', 'de', 'deutschland'],
	France: ['france', 'fr'],
	Netherlands: ['netherlands', 'nl', 'holland'],
	Ireland: ['ireland', 'ie', 'eire'],
	Singapore: ['singapore', 'sg'],
	'New Zealand': ['new zealand', 'nz'],
	Japan: ['japan', 'jp'],
	'United Arab Emirates': ['united arab emirates', 'uae', 'u.a.e.']
};

/** True when `address` already ends with the country name or a known alias. */
export function addressEndsWithCountry(
	address: string | undefined | null,
	country: string | undefined | null
): boolean {
	if (!address?.trim() || !country?.trim()) return false;
	const lastLine = address
		.trim()
		.split(/\n/)
		.filter(Boolean)
		.pop()!
		.trim()
		.toLowerCase()
		.replace(/[.,;:]+$/g, '')
		.trim();

	const aliases = new Set(
		(COUNTRY_ADDRESS_ALIASES[country] ?? []).concat(country.toLowerCase())
	);
	return aliases.has(lastLine);
}
