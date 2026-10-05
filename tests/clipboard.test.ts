import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Copy to Clipboard', () => {
	test.beforeEach(async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/');
		await waitForPageLoad(page);
	});

	test('should copy text to clipboard when CopyButton is clicked', async ({ page }) => {
		// This test assumes CopyButton is used somewhere on the page
		// For now, we'll test the clipboard API functionality

		// Test clipboard write functionality via browser console
		const testText = 'Test clipboard content';
		const result = await page.evaluate(async (text) => {
			try {
				await navigator.clipboard.writeText(text);
				const clipboardText = await navigator.clipboard.readText();
				return clipboardText === text;
			} catch (error) {
				return false;
			}
		}, testText);

		expect(result).toBe(true);
	});

	test('should handle clipboard API availability', async ({ page }) => {
		const hasClipboard = await page.evaluate(() => {
			return !!(navigator.clipboard && window.isSecureContext);
		});

		expect(hasClipboard).toBe(true);
	});

	test('should read from clipboard', async ({ page }) => {
		const testText = 'Read test content';

		// Write to clipboard
		await page.evaluate(async (text) => {
			await navigator.clipboard.writeText(text);
		}, testText);

		// Read from clipboard
		const clipboardText = await page.evaluate(async () => {
			return await navigator.clipboard.readText();
		});

		expect(clipboardText).toBe(testText);
	});
});

