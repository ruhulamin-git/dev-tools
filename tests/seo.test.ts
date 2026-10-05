import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('SEO', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
	});

	test('should have page title', async ({ page }) => {
		await page.waitForLoadState('domcontentloaded');
		const title = await page.title();
		expect(title).toBeTruthy();
		expect(title.length).toBeGreaterThan(0);
	});

	test('should have meta description', async ({ page }) => {
		const metaDescription = page.locator('meta[name="description"]');
		await expect(metaDescription).toHaveAttribute('content', { timeout: 5000 });

		const content = await metaDescription.getAttribute('content');
		expect(content).toBeTruthy();
		expect(content?.length).toBeGreaterThan(0);
	});

	test('should have Open Graph tags', async ({ page }) => {
		const ogTitle = page.locator('meta[property="og:title"]');
		await expect(ogTitle).toHaveAttribute('content', { timeout: 5000 });

		const ogDescription = page.locator('meta[property="og:description"]');
		await expect(ogDescription).toHaveAttribute('content', { timeout: 5000 });

		const ogType = page.locator('meta[property="og:type"]');
		await expect(ogType).toHaveAttribute('content', { timeout: 5000 });
	});

	test('should have Twitter Card tags', async ({ page }) => {
		const twitterCard = page.locator('meta[name="twitter:card"]');
		await expect(twitterCard).toHaveAttribute('content', { timeout: 5000 });

		const twitterTitle = page.locator('meta[name="twitter:title"]');
		await expect(twitterTitle).toHaveAttribute('content', { timeout: 5000 });
	});

	test('should have canonical URL', async ({ page }) => {
		const canonical = page.locator('link[rel="canonical"]');
		await expect(canonical).toHaveAttribute('href', { timeout: 5000 });
	});

	test('should have schema.org markup', async ({ page }) => {
		// Schema markup is in script tags (not visible, but exists in DOM)
		const schemaScript = page.locator('script[type="application/ld+json"]');
		const schemaCount = await schemaScript.count();

		// Should have at least one schema script
		expect(schemaCount).toBeGreaterThan(0);

		if (schemaCount > 0) {
			const schemaContent = await schemaScript.first().textContent();
			expect(schemaContent).toBeTruthy();
			if (schemaContent) {
				expect(schemaContent).toContain('@context');
				expect(schemaContent).toContain('@type');
			}
		}
	});

	test('should have proper H1 tag', async ({ page }) => {
		const h1 = page.locator('h1');
		await expect(h1.first()).toBeVisible({ timeout: 10000 });

		const h1Text = await h1.first().textContent();
		expect(h1Text).toBeTruthy();
		expect(h1Text?.trim().length).toBeGreaterThan(0);
	});

	test('should have semantic HTML structure', async ({ page }) => {
		// Check for semantic elements
		await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('footer')).toBeVisible({ timeout: 10000 });
	});
});

