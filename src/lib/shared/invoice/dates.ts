/** Unambiguous 3-letter months: `25 Aug 2026`, `1 Sep 2026` (never MM/DD/YYYY, never "Sept"). */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseIsoDate(dateString: string): Date | null {
	if (!dateString) return null;
	const d = new Date(`${dateString}T12:00:00`);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function formatUnambiguousDate(dateString: string): string {
	const d = parseIsoDate(dateString);
	if (!d) return '';
	return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Invoice PDF dates always use three-letter month abbreviations for consistency
 * (`1 Sep 2026`, not `1 Sept 2026`). Recipient country no longer switches to locale
 * short-month forms that vary in length.
 */
export function formatInvoiceDate(dateString: string, _recipientCountry?: string | null): string {
	return formatUnambiguousDate(dateString);
}
