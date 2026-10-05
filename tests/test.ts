import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Home Page', () => {
	test('should load home page', async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
		await expect(page).toHaveURL('/');
	});

	test('should display welcome heading', async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
		await expect(page.locator('h2').first()).toBeVisible({ timeout: 10000 });
	});

	test('should have main content area', async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
		const main = page.locator('main');
		await expect(main).toBeVisible({ timeout: 10000 });
	});

	test('should be accessible', async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);

		// Basic accessibility checks
		const title = await page.title();
		expect(title).toBeTruthy();

		const h1 = page.locator('h1');
		await expect(h1.first()).toBeVisible({ timeout: 10000 });
	});
});
