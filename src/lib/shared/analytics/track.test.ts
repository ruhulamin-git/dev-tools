import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { track } from './track';

describe('track', () => {
	beforeEach(() => {
		window.dataLayer = [];
		localStorage.clear();
		// Most of these tests are about what track() pushes, not about consent gating (which has
		// its own describe block below) — grant it up front so they aren't coupled to the default.
		localStorage.setItem('dxh_consent', JSON.stringify({ analytics: true }));
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('pushes the event and props onto window.dataLayer', () => {
		track('cta_click', { tool: 'hash-generator', label: 'primary' });

		expect(window.dataLayer).toEqual([
			{ event: 'cta_click', tool: 'hash-generator', label: 'primary' }
		]);
	});

	it('pushes an event with no props', () => {
		track('search');

		expect(window.dataLayer).toEqual([{ event: 'search' }]);
	});

	describe('consent gating', () => {
		it('does nothing when analytics consent is explicitly denied', () => {
			localStorage.setItem('dxh_consent', JSON.stringify({ analytics: false }));

			track('cta_click');

			expect(window.dataLayer).toEqual([]);
		});

		it('does nothing by default when no consent choice has been recorded yet', () => {
			localStorage.clear(); // undo the beforeEach grant — this test is about its absence

			track('cta_click');

			expect(window.dataLayer).toEqual([]);
		});

		it('fires when consent is explicitly granted', () => {
			track('cta_click');

			expect(window.dataLayer).toEqual([{ event: 'cta_click' }]);
		});
	});
});
