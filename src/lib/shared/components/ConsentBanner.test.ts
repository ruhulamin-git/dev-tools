import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import ConsentBanner from './ConsentBanner.svelte';

describe('ConsentBanner', () => {
	afterEach(() => {
		localStorage.clear();
	});

	it('shows when no consent decision has been recorded', async () => {
		render(ConsentBanner);
		expect(await screen.findByRole('region', { name: 'Cookie consent' })).toBeTruthy();
	});

	it('does not show once a decision has already been recorded', () => {
		localStorage.setItem('dxh_consent', JSON.stringify({ analytics: true }));
		render(ConsentBanner);
		expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
	});

	it('records granted consent and hides on Accept', async () => {
		render(ConsentBanner);
		await fireEvent.click(await screen.findByRole('button', { name: 'Accept' }));

		expect(localStorage.getItem('dxh_consent')).toBe(JSON.stringify({ analytics: true }));
		expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
	});

	it('records denied consent and hides on Decline', async () => {
		render(ConsentBanner);
		await fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));

		expect(localStorage.getItem('dxh_consent')).toBe(JSON.stringify({ analytics: false }));
		expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull();
	});
});
