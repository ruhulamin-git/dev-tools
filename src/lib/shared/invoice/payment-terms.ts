import type { PaymentTermsPreset } from './types';

export type { PaymentTermsPreset };

export const PAYMENT_TERMS_PRESETS: PaymentTermsPreset[] = [
	'Due on receipt',
	'Net 7',
	'Net 14',
	'Net 30',
	'Net 60',
	'Custom'
];

const NET_DAYS: Partial<Record<PaymentTermsPreset, number>> = {
	'Due on receipt': 0,
	'Net 7': 7,
	'Net 14': 14,
	'Net 30': 30,
	'Net 60': 60
};

/** Add calendar days to an ISO date string (YYYY-MM-DD). */
export function addDaysToIsoDate(isoDate: string, days: number): string {
	if (!isoDate) return '';
	const d = new Date(`${isoDate}T12:00:00`);
	if (Number.isNaN(d.getTime())) return '';
	d.setDate(d.getDate() + days);
	return d.toISOString().split('T')[0];
}

export function dueDateFromTerms(issuedDate: string, terms: PaymentTermsPreset): string | null {
	if (terms === 'Custom') return null;
	const days = NET_DAYS[terms];
	if (days === undefined) return null;
	return addDaysToIsoDate(issuedDate, days);
}

export function termsLabelForPdf(terms: PaymentTermsPreset | undefined): string | null {
	if (!terms) return null;
	return terms;
}
