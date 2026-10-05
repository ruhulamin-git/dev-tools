import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Toast Notifications', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
	});

	test('should display toast container', async ({ page }) => {
		// Toast container exists in DOM but may be hidden when empty (which is correct)
		const toaster = page.locator('[role="region"][aria-label="Notifications"]');
		await expect(toaster).toHaveCount(1, { timeout: 10000 });
		// Check it exists in DOM (even if not visible)
		const count = await toaster.count();
		expect(count).toBe(1);
	});

	test('should have toast container ready', async ({ page }) => {
		// Check if toast container exists in DOM (toasts are triggered by user actions)
		// Container may be hidden when empty, which is correct behavior
		const toastRegion = page.locator('[role="region"][aria-label="Notifications"]');
		await expect(toastRegion).toHaveCount(1, { timeout: 10000 });
	});

	test('toast container should have proper ARIA attributes', async ({ page }) => {
		// Toast container exists in DOM but may be hidden when empty
		const toaster = page.locator('[role="region"][aria-label="Notifications"]');
		await expect(toaster).toHaveCount(1, { timeout: 10000 });
		// Check ARIA attributes even if hidden
		await expect(toaster).toHaveAttribute('role', 'region');
		await expect(toaster).toHaveAttribute('aria-label', 'Notifications');
		await expect(toaster).toHaveAttribute('aria-live', 'polite');
	});
});

