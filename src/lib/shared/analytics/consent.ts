/**
 * Analytics consent gate, backing both `track()` (this module's main caller) and the Google
 * Consent Mode v2 signal set from app.html's inline script (which reads/writes the same
 * `dxh_consent` key, synchronously, before this module — or any of the app's JS bundle — loads).
 *
 * No decision recorded yet defaults to *denied*, not granted — this app serves EU visitors
 * (Devxhub has a Finland office) and analytics is non-essential, so the GDPR-correct default
 * before a visitor has made a choice is off, not on. `ConsentBanner.svelte` is what lets them
 * make that choice.
 */

const CONSENT_STORAGE_KEY = 'dxh_consent';

interface StoredConsent {
	analytics?: boolean;
}

function readStoredConsent(): StoredConsent | null {
	try {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (raw === null) return null;
		return JSON.parse(raw) as StoredConsent;
	} catch {
		return null;
	}
}

export function hasAnalyticsConsent(): boolean {
	if (typeof window === 'undefined') return false;
	return readStoredConsent()?.analytics === true;
}

/** Whether the visitor has made *any* choice yet — false means the banner should still show. */
export function hasConsentDecision(): boolean {
	if (typeof window === 'undefined') return false;
	return readStoredConsent() !== null;
}

/**
 * Record the visitor's choice and tell GTM about it immediately via a Consent Mode v2 'update'
 * command (the 'default' command, in app.html, only ever runs once, before this choice exists;
 * 'update' is what lets a tag that already fired — or is about to — pick up a decision made
 * mid-session).
 */
export function setAnalyticsConsent(granted: boolean): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: granted }));
	} catch {
		// Private browsing / storage disabled — the in-session dataLayer push below still lets
		// this page load respect the choice, even though it won't be remembered next visit.
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push([
		'consent',
		'update',
		{ analytics_storage: granted ? 'granted' : 'denied' }
	]);
}
