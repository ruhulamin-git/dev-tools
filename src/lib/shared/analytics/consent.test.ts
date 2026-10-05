import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { hasAnalyticsConsent, hasConsentDecision, setAnalyticsConsent } from './consent';

describe('hasAnalyticsConsent', () => {
	afterEach(() => {
		localStorage.clear();
	});

	it('defaults to false (denied) when no consent choice has been recorded', () => {
		// GDPR-correct default for a non-essential purpose: off until the visitor opts in, not
		// on until they opt out.
		expect(hasAnalyticsConsent()).toBe(false);
	});

	it('returns true when analytics consent is explicitly granted', () => {
		localStorage.setItem('dxh_consent', JSON.stringify({ analytics: true }));
		expect(hasAnalyticsConsent()).toBe(true);
	});

	it('returns false when analytics consent is explicitly denied', () => {
		localStorage.setItem('dxh_consent', JSON.stringify({ analytics: false }));
		expect(hasAnalyticsConsent()).toBe(false);
	});

	it('fails closed (false) on malformed stored consent', () => {
		localStorage.setItem('dxh_consent', 'not valid json{');
		expect(hasAnalyticsConsent()).toBe(false);
	});
});

describe('hasConsentDecision', () => {
	afterEach(() => {
		localStorage.clear();
	});

	it('is false when nothing has been recorded (the banner should show)', () => {
		expect(hasConsentDecision()).toBe(false);
	});

	it('is true once any choice has been recorded, granted or denied', () => {
		localStorage.setItem('dxh_consent', JSON.stringify({ analytics: false }));
		expect(hasConsentDecision()).toBe(true);
	});
});

describe('setAnalyticsConsent', () => {
	beforeEach(() => {
		window.dataLayer = [];
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('persists a granted choice and makes hasAnalyticsConsent reflect it', () => {
		setAnalyticsConsent(true);
		expect(hasAnalyticsConsent()).toBe(true);
		expect(hasConsentDecision()).toBe(true);
	});

	it('persists a denied choice', () => {
		setAnalyticsConsent(false);
		expect(hasAnalyticsConsent()).toBe(false);
		expect(hasConsentDecision()).toBe(true);
	});

	it('pushes a Consent Mode v2 update command to the dataLayer', () => {
		setAnalyticsConsent(true);
		expect(window.dataLayer).toEqual([['consent', 'update', { analytics_storage: 'granted' }]]);
	});

	it('pushes a denied update command when consent is revoked', () => {
		setAnalyticsConsent(false);
		expect(window.dataLayer).toEqual([['consent', 'update', { analytics_storage: 'denied' }]]);
	});
});
