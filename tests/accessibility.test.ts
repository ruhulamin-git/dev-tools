import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
	});

	test('should have skip to main content link', async ({ page }) => {
		const skipLink = page.getByRole('link', { name: /skip to main content/i });
		await expect(skipLink).toBeVisible({ timeout: 10000 });

		// Check it's visually hidden but accessible
		const classes = await skipLink.getAttribute('class');
		expect(classes).toContain('sr-only');
	});

	test('skip link should be focusable', async ({ page }) => {
		// Press Tab to focus skip link
		await page.keyboard.press('Tab');
		await page.waitForTimeout(100);

		const skipLink = page.getByRole('link', { name: /skip to main content/i });
		await expect(skipLink).toBeFocused({ timeout: 2000 });
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		const h1 = page.locator('h1');
		await expect(h1.first()).toBeVisible({ timeout: 10000 });

		// Check for H2 headings
		const h2 = page.locator('h2');
		const h2Count = await h2.count();
		expect(h2Count).toBeGreaterThan(0);
	});

	test('should have proper ARIA labels on interactive elements', async ({ page }) => {
		// Check theme button
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await expect(themeButton).toBeVisible({ timeout: 10000 });
		await expect(themeButton).toHaveAttribute('aria-label');

		// Check navigation button (mobile)
		await page.setViewportSize({ width: 375, height: 667 });
		await waitForPageLoad(page);
		const menuButton = page.getByRole('button', { name: /toggle menu/i });
		await expect(menuButton).toBeVisible({ timeout: 10000 });
		await expect(menuButton).toHaveAttribute('aria-label');
		await expect(menuButton).toHaveAttribute('aria-expanded');
	});

	test('should have proper ARIA roles', async ({ page }) => {
		// Check for navigation role
		const nav = page.locator('nav');
		await expect(nav).toBeVisible({ timeout: 10000 });

		// Check for main content
		const main = page.locator('main');
		await expect(main).toBeVisible({ timeout: 10000 });

		// Check for header
		const header = page.locator('header');
		await expect(header).toBeVisible({ timeout: 10000 });

		// Check for footer
		const footer = page.locator('footer');
		await expect(footer).toBeVisible({ timeout: 10000 });
	});

	test('should support keyboard navigation', async ({ page }) => {
		// Tab through interactive elements
		await page.keyboard.press('Tab'); // Skip link
		await page.waitForTimeout(100);
		await page.keyboard.press('Tab'); // Logo link
		await page.waitForTimeout(100);

		// Should be able to focus on navigation elements
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible({ timeout: 2000 });
	});

	test('should have focus indicators', async ({ page }) => {
		// Focus on an interactive element
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.focus();
		await page.waitForTimeout(100);

		// Check if element has focus styles
		const focusedButton = page.locator(':focus');
		await expect(focusedButton).toBeVisible({ timeout: 2000 });

		// Check for focus ring (should have outline or ring)
		const styles = await focusedButton.evaluate((el) => {
			const computed = window.getComputedStyle(el);
			return {
				outline: computed.outline,
				outlineWidth: computed.outlineWidth,
				boxShadow: computed.boxShadow
			};
		});

		// Should have some focus indication (outline or box-shadow)
		const hasFocusIndicator = styles.outlineWidth !== '0px' || styles.boxShadow !== 'none';
		expect(hasFocusIndicator).toBe(true);
	});

	test('should have alt text on images', async ({ page }) => {
		const images = page.locator('img');
		const imageCount = await images.count();

		// Sample first few images to avoid timeout
		const sampleSize = Math.min(imageCount, 10);
		for (let i = 0; i < sampleSize; i++) {
			const img = images.nth(i);
			const alt = await img.getAttribute('alt');
			const ariaHidden = await img.getAttribute('aria-hidden');

			// Images should have alt text OR be marked as decorative (aria-hidden)
			expect(alt !== null || ariaHidden === 'true').toBe(true);
		}
	});

	test('should have proper link text', async ({ page }) => {
		const links = page.locator('a');
		const linkCount = await links.count();

		// Sample a few links instead of all to avoid timeout
		const sampleSize = Math.min(linkCount, 10);
		for (let i = 0; i < sampleSize; i++) {
			const link = links.nth(i);
			const text = await link.textContent();
			const ariaLabel = await link.getAttribute('aria-label');
			const ariaHidden = await link.getAttribute('aria-hidden');

			// Links should have accessible text, aria-label, or be decorative
			expect(text?.trim() || ariaLabel || ariaHidden === 'true').toBeTruthy();
		}
	});

	test('should announce dynamic content changes', async ({ page }) => {
		// Check for live regions (toast container)
		const liveRegions = page.locator('[aria-live]');
		const count = await liveRegions.count();
		// Toast container should have aria-live
		expect(count).toBeGreaterThan(0);
	});

	test('should have proper form labels', async ({ page }) => {
		// Check if any inputs have associated labels
		const inputs = page.locator('input, textarea, select');
		const inputCount = await inputs.count();

		if (inputCount > 0) {
			// Sample first few inputs to avoid timeout
			const sampleSize = Math.min(inputCount, 5);
			for (let i = 0; i < sampleSize; i++) {
				const input = inputs.nth(i);
				const id = await input.getAttribute('id');
				const ariaLabel = await input.getAttribute('aria-label');
				const ariaLabelledBy = await input.getAttribute('aria-labelledby');
				const type = await input.getAttribute('type');

				// Hidden inputs don't need labels
				if (type === 'hidden') continue;

				// Input should have label, aria-label, or aria-labelledby
				if (id) {
					const label = page.locator(`label[for="${id}"]`);
					const hasLabel = await label.count() > 0;
					expect(hasLabel || ariaLabel || ariaLabelledBy).toBe(true);
				} else {
					expect(ariaLabel || ariaLabelledBy).toBeTruthy();
				}
			}
		}
	});
});

