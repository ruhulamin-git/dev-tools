import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Select from './select.svelte';

const options = [
	{ value: 'United States', label: 'United States' },
	{ value: 'United Kingdom', label: 'United Kingdom' },
	{ value: 'Bangladesh', label: 'Bangladesh' }
];

describe('Select searchable', () => {
	it('focuses the search input when opened', async () => {
		render(Select, {
			props: {
				options,
				searchable: true,
				placeholder: 'Select...',
				ariaLabel: 'Country'
			}
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Country' }));

		const search = await screen.findByPlaceholderText('Search...');
		await waitFor(() => {
			expect(document.activeElement).toBe(search);
		});
	});

	it('filters options by search query', async () => {
		render(Select, {
			props: {
				options,
				searchable: true,
				placeholder: 'Select...',
				ariaLabel: 'Country'
			}
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Country' }));
		const search = await screen.findByPlaceholderText('Search...');
		await fireEvent.input(search, { target: { value: 'bangla' } });

		expect(screen.getByRole('option', { name: 'Bangladesh' })).toBeTruthy();
		expect(screen.queryByRole('option', { name: 'United States' })).toBeNull();
	});

	it('does not render a search input when searchable is false', async () => {
		render(Select, {
			props: {
				options,
				searchable: false,
				placeholder: 'Select...',
				ariaLabel: 'Currency'
			}
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Currency' }));
		expect(screen.queryByPlaceholderText('Search...')).toBeNull();
	});
});
