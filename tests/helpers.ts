/**
 * Test Helpers
 *
 * Common utilities for E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
	await page.waitForLoadState('networkidle');
	await page.waitForLoadState('domcontentloaded');
	// Small delay to ensure all JS has executed
	await page.waitForTimeout(100);
}

/**
 * Check if element is visible (with error handling)
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
	try {
		const element = page.locator(selector);
		return await element.isVisible();
	} catch {
		return false;
	}
}

/**
 * Wait for element to be visible (with timeout)
 */
export async function waitForElement(
	page: Page,
	selector: string,
	options?: { timeout?: number }
): Promise<void> {
	const timeout = options?.timeout || 5000;
	await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Get element safely (returns null if not found)
 */
export async function getElementSafely(page: Page, selector: string) {
	try {
		const element = page.locator(selector);
		const count = await element.count();
		return count > 0 ? element.first() : null;
	} catch {
		return null;
	}
}

/**
 * Check if element has attribute (with error handling)
 */
export async function hasAttribute(
	page: Page,
	selector: string,
	attribute: string
): Promise<boolean> {
	try {
		const element = page.locator(selector).first();
		const value = await element.getAttribute(attribute);
		return value !== null;
	} catch {
		return false;
	}
}

