/**
 * Payment-service names / patterns that conflict with a populated bank Payment Details block
 * when they also appear in Notes. Extend as needed.
 */
export const PAYMENT_SERVICE_TERMS: string[] = [
	'wise',
	'paypal',
	'payoneer',
	'stripe',
	'square',
	'venmo',
	'zelle',
	'revolut',
	'remitly',
	'western union',
	'moneygram',
	'xoom',
	'transferwise',
	'ach',
	'bkash',
	'nagad',
	'rocket'
];

const URL_RE = /https?:\/\/[^\s]+|www\.[^\s]+/i;

export function notesConflictWithPaymentDetails(
	notes: string,
	hasPaymentDetails: boolean
): boolean {
	if (!hasPaymentDetails || !notes?.trim()) return false;
	if (URL_RE.test(notes)) return true;
	const lower = notes.toLowerCase();
	return PAYMENT_SERVICE_TERMS.some((term) => {
		const re = new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'i');
		return re.test(lower);
	});
}
