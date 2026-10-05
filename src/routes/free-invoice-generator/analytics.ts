/**
 * Invoice generator GTM helpers. No PII — event name only.
 * Each event fires at most once per browser session.
 */
const firedThisSession = new Set<string>();

export function pushInvoiceEventOnce(event: string): void {
	if (typeof window === 'undefined') return;
	const key = `dxh_invoice_evt_${event}`;
	if (firedThisSession.has(key)) return;
	try {
		if (sessionStorage.getItem(key)) {
			firedThisSession.add(key);
			return;
		}
		sessionStorage.setItem(key, '1');
	} catch {
		// private mode / quota — in-memory Set still limits to once per page load
	}
	firedThisSession.add(key);
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event });
}
