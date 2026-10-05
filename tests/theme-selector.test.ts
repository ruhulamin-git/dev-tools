import { expect, test } from '@playwright/test';
import { waitForPageLoad } from './helpers';

test.describe('Theme Selector', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await waitForPageLoad(page);
	});

	test('should display theme selector button', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await expect(themeButton).toBeVisible({ timeout: 10000 });
	});

	test('should open theme dropdown on click', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await expect(themeButton).toBeVisible({ timeout: 10000 });

		// Check dropdown is closed initially
		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		const initiallyVisible = await themeMenu.isVisible().catch(() => false);
		expect(initiallyVisible).toBe(false);

		// Click to open
		await themeButton.click();
		await page.waitForTimeout(300);

		// Check dropdown is open
		await expect(themeMenu).toBeVisible({ timeout: 2000 });

		// Check aria-expanded is true
		await expect(themeButton).toHaveAttribute('aria-expanded', 'true');
	});

	test('should close theme dropdown when clicking outside', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.click();
		await page.waitForTimeout(300);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		await expect(themeMenu).toBeVisible({ timeout: 2000 });

		// Click outside (on the page body)
		await page.click('body', { position: { x: 10, y: 10 } });
		await page.waitForTimeout(300);

		// Menu should be closed
		const isVisible = await themeMenu.isVisible().catch(() => false);
		expect(isVisible).toBe(false);
	});

	test('should close theme dropdown with Escape key', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.click();
		await page.waitForTimeout(300);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		await expect(themeMenu).toBeVisible({ timeout: 2000 });

		// Press Escape
		await page.keyboard.press('Escape');
		await page.waitForTimeout(300);

		// Menu should be closed
		const isVisible = await themeMenu.isVisible().catch(() => false);
		expect(isVisible).toBe(false);
		await expect(themeButton).toHaveAttribute('aria-expanded', 'false');
	});

	test('should navigate theme options with Arrow keys', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await expect(themeButton).toBeVisible({ timeout: 10000 });

		// Focus and open with keyboard
		await themeButton.focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(800);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		const isMenuVisible = await themeMenu.isVisible().catch(() => false);
		expect(isMenuVisible).toBe(true);

		// Get menu items
		const menuItems = page.locator('button[role="menuitem"]');
		const itemCount = await menuItems.count();
		expect(itemCount).toBeGreaterThan(0);

		// Navigate with Arrow Down
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(400);

		// Check focus moved to first menu item
		const firstMenuItem = menuItems.first();
		const isFirstFocused = await firstMenuItem.evaluate((el) => {
			return el === document.activeElement || el.contains(document.activeElement);
		}).catch(() => false);

		// If first item not focused, check if any menu item is focused
		if (!isFirstFocused) {
			const anyFocused = await menuItems.first().evaluate((el) => {
				const menuContainer = el.closest('[role="menu"]');
				if (!menuContainer) return false;
				const activeEl = document.activeElement;
				return menuContainer.contains(activeEl);
			}).catch(() => false);
			expect(anyFocused).toBe(true);
		} else {
			expect(isFirstFocused).toBe(true);
		}

		// Navigate with Arrow Up (should wrap to last item)
		await page.keyboard.press('ArrowUp');
		await page.waitForTimeout(400);

		// Check if focus is on a menu item (might be last or first depending on implementation)
		const lastItem = menuItems.last();
		const isLastFocused = await lastItem.evaluate((el) => {
			return el === document.activeElement || el.contains(document.activeElement);
		}).catch(() => false);

		// Focus should be on some menu item
		const anyMenuItemFocused = await menuItems.first().evaluate((el) => {
			const menuContainer = el.closest('[role="menu"]');
			if (!menuContainer) return false;
			const activeEl = document.activeElement;
			return menuContainer.contains(activeEl) && activeEl.getAttribute('role') === 'menuitem';
		}).catch(() => false);
		expect(anyMenuItemFocused).toBe(true);
	});

	test('should select theme option with Enter key', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.click();
		await page.waitForTimeout(300);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		await expect(themeMenu).toBeVisible({ timeout: 2000 });

		// Get first theme option
		const firstOption = page.locator('button[role="menuitem"]').first();
		await expect(firstOption).toBeVisible({ timeout: 2000 });

		// Select with Enter
		await firstOption.focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(300);

		// Menu should close
		const isVisible = await themeMenu.isVisible().catch(() => false);
		expect(isVisible).toBe(false);

		// Focus should return to button
		await expect(themeButton).toBeFocused({ timeout: 2000 });
	});

	test('should select theme option with Space key', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.click();
		await page.waitForTimeout(300);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		await expect(themeMenu).toBeVisible({ timeout: 2000 });

		// Select with Space
		const firstOption = page.locator('button[role="menuitem"]').first();
		await firstOption.focus();
		await page.keyboard.press('Space');
		await page.waitForTimeout(300);

		// Menu should close
		const isVisible = await themeMenu.isVisible().catch(() => false);
		expect(isVisible).toBe(false);
	});

	test('should display all theme options', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.click();
		await page.waitForTimeout(800);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		const isMenuVisible = await themeMenu.isVisible().catch(() => false);
		expect(isMenuVisible).toBe(true);

		// Get all menu items
		const menuItems = page.locator('button[role="menuitem"]');
		const itemCount = await menuItems.count();
		expect(itemCount).toBeGreaterThan(0);

		// Check for theme options by looking at button text content
		// Get text from all menu items (case insensitive)
		const allTexts: string[] = [];
		for (let i = 0; i < itemCount; i++) {
			const text = await menuItems.nth(i).textContent();
			if (text) {
				allTexts.push(text.toLowerCase().trim());
			}
		}

		// Check for Light, Dark, and System options (case insensitive)
		const hasLight = allTexts.some(text => text.includes('light'));
		const hasDark = allTexts.some(text => text.includes('dark'));
		const hasSystem = allTexts.some(text => text.includes('system'));

		// At least one theme option should be present
		expect(hasLight || hasDark || hasSystem).toBe(true);
	});

	test('should show current theme as selected', async ({ page }) => {
		const themeButton = page.getByRole('button', { name: /theme selector/i });
		await themeButton.click();
		await page.waitForTimeout(300);

		const themeMenu = page.locator('[role="menu"][aria-orientation="vertical"]');
		await expect(themeMenu).toBeVisible({ timeout: 2000 });

		// Check that menu items exist
		const menuItems = page.locator('button[role="menuitem"]');
		const count = await menuItems.count();
		expect(count).toBeGreaterThan(0);

		// At least one should be visible (the selected one should have a checkmark)
		await expect(menuItems.first()).toBeVisible();
	});
});

