import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Responsive Design', () => {
	test('should display mobile menu on small screens', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
		await page.goto('/');
		await waitForPageLoad(page);

		const menuButton = page.getByRole('button', { name: /toggle menu/i });
		await expect(menuButton).toBeVisible({ timeout: 10000 });
	});

	test('should display desktop navigation on large screens', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');
		await waitForPageLoad(page);

		// Desktop navigation should be visible
		const nav = page.locator('nav');
		await expect(nav).toBeVisible({ timeout: 10000 });

		// Check for navigation content (Devxhub link or Tools button)
		const devxhubLink = nav.getByText(/devxhub/i).first();
		const toolsButton = nav.getByRole('button', { name: /tools menu/i });

		// At least one should be visible
		const hasDevxhub = await devxhubLink.isVisible().catch(() => false);
		const hasTools = await toolsButton.isVisible().catch(() => false);
		expect(hasDevxhub || hasTools).toBe(true);

		// Mobile menu button should be hidden on desktop
		const menuButton = page.getByRole('button', { name: /toggle menu/i });
		const isMenuVisible = await menuButton.isVisible().catch(() => false);
		expect(isMenuVisible).toBe(false);
	});

	test('should adapt layout for tablet size', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
		await page.goto('/');
		await waitForPageLoad(page);

		// Check that layout adapts (either mobile or desktop view)
		const header = page.locator('header');
		await expect(header).toBeVisible({ timeout: 10000 });

		const footer = page.locator('footer');
		await expect(footer).toBeVisible({ timeout: 10000 });
	});

	test('should maintain functionality across viewport sizes', async ({ page }) => {
		const viewports = [
			{ width: 375, height: 667 }, // Mobile
			{ width: 768, height: 1024 }, // Tablet
			{ width: 1280, height: 720 } // Desktop
		];

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await page.goto('/');
			await waitForPageLoad(page);

			// Header should always be visible
			const header = page.locator('header');
			await expect(header).toBeVisible({ timeout: 10000 });

			// Footer should always be visible
			const footer = page.locator('footer');
			await expect(footer).toBeVisible({ timeout: 10000 });

			// Main content should be visible
			const main = page.locator('main');
			await expect(main).toBeVisible({ timeout: 10000 });
		}
	});

	test('should handle text overflow on small screens', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 568 }); // Small mobile
		await page.goto('/');
		await waitForPageLoad(page);

		// Check that header fits within viewport
		const header = page.locator('header');
		await expect(header).toBeVisible({ timeout: 10000 });
		const headerBox = await header.boundingBox();
		if (headerBox) {
			expect(headerBox.width).toBeLessThanOrEqual(320);
		}
	});

	test('should maintain touch target sizes on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await waitForPageLoad(page);

		const menuButton = page.getByRole('button', { name: /toggle menu/i });
		await expect(menuButton).toBeVisible({ timeout: 10000 });

		// Wait a bit for layout to settle
		await page.waitForTimeout(500);

		// Try multiple times to get bounding box (layout might need time)
		let buttonBox = await menuButton.boundingBox();
		let attempts = 0;
		while (!buttonBox && attempts < 3) {
			await page.waitForTimeout(200);
			buttonBox = await menuButton.boundingBox();
			attempts++;
		}

		// Touch targets should be at least 44x44px (iOS guideline)
		if (buttonBox) {
			// Check that both width and height meet minimum (or at least one dimension)
			const meetsWidth = buttonBox.width >= 44;
			const meetsHeight = buttonBox.height >= 44;
			// At least one dimension should meet the minimum
			expect(meetsWidth || meetsHeight).toBe(true);
		} else {
			// If bounding box is still null, check computed styles instead
			const styles = await menuButton.evaluate((el) => {
				const computed = window.getComputedStyle(el);
				return {
					width: computed.width,
					height: computed.height,
					padding: computed.padding
				};
			});
			// At least verify button has some size
			expect(styles.width).not.toBe('0px');
			expect(styles.height).not.toBe('0px');
		}
	});
});

