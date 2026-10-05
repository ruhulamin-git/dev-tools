import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LeadMagnetInline from './LeadMagnetInline.svelte';

const baseProps = {
	title: 'Get the guide',
	description: 'A short guide',
	toolName: 'JSON Formatter & Validator'
};

async function fillAndSubmit(name: string, email: string, website = '') {
	await fireEvent.input(screen.getByLabelText('Full Name'), { target: { value: name } });
	await fireEvent.input(screen.getByLabelText('Email*'), { target: { value: email } });
	if (website) {
		await fireEvent.input(screen.getByLabelText('Website'), { target: { value: website } });
	}
	await fireEvent.click(screen.getByRole('button', { name: /get free guide/i }));
}

describe('LeadMagnetInline — bot detection', () => {
	let fetchSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });
		fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', fetchSpy);
		// downloadPDF() clicks a real <a download> element; jsdom doesn't implement navigation
		// and logs a noisy (harmless) warning for it on every submit. Stubbed out since the PDF
		// download itself isn't what these bot-detection tests are checking.
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('does not call the lead API when the honeypot field is filled', async () => {
		render(LeadMagnetInline, { props: baseProps });
		vi.advanceTimersByTime(2000); // past MIN_SUBMIT_MS, so timing alone doesn't explain it

		await fillAndSubmit('Bot Name', 'bot@example.com', 'https://spam.example');

		expect(fetchSpy).not.toHaveBeenCalled();
		// Still shows success — a bot's script gets no signal it was caught.
		expect(await screen.findByText('Success!')).not.toBeNull();
	});

	it('does not call the lead API when the form is submitted faster than a human could', async () => {
		render(LeadMagnetInline, { props: baseProps });
		// No time advance: submission happens "instantly" after render, as a script filling
		// and submitting a form programmatically would.

		await fillAndSubmit('Fast Name', 'fast@example.com');

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('calls the lead API for a normal submission with an empty honeypot after a human-plausible delay', async () => {
		render(LeadMagnetInline, { props: baseProps });
		vi.advanceTimersByTime(2000);

		await fillAndSubmit('Real Person', 'real@example.com');

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledWith(
			expect.stringContaining('/leadmagnet/'),
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('still shows success and never calls the API when fetch itself fails or times out', async () => {
		fetchSpy.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'));
		render(LeadMagnetInline, { props: baseProps });
		vi.advanceTimersByTime(2000);

		await fillAndSubmit('Real Person', 'real@example.com');

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(await screen.findByText('Success!')).not.toBeNull();
	});
});
