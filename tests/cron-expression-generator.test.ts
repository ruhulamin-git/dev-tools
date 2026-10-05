import { expect, test, type Page } from '@playwright/test';
import { waitForPageLoad } from './helpers';

/**
 * Smoke test for the Cron Expression Generator.
 *
 * Deliberately concentrated on the things unit tests cannot see: that the page hydrates and
 * computes run times in the browser rather than shipping build-time dates, that clicking a
 * field selects its text in the input, and that the legend panel does not tear itself down
 * as you move between fields. Every one of those has broken at least once in a way the unit
 * suite was happy with.
 */

const ROUTE = '/cron-expression-generator';

const input = (page: Page) => page.locator('#cron-expression');
const explanation = (page: Page) => page.locator('#cron-explanation');
const legend = (page: Page) => page.getByText(/^Allowed in/);
const card = (page: Page, field: string) =>
	page.getByRole('button', { name: new RegExp(`select the ${field} field`, 'i') });

async function setExpression(page: Page, value: string) {
	await input(page).fill(value);
	// The explanation is recomputed on every keystroke; give it a beat to settle.
	await expect(explanation(page)).not.toBeEmpty();
}

test.describe('Cron Expression Generator', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(ROUTE);
		await waitForPageLoad(page);
	});

	test('explains the expression it loads with', async ({ page }) => {
		await expect(input(page)).toHaveValue('*/15 9-17 * * 1-5');
		await expect(explanation(page)).toContainText('Every 15 minutes');
		await expect(explanation(page)).toContainText('Monday through Friday');
	});

	test('explains a new expression as it is typed', async ({ page }) => {
		await setExpression(page, '30 6 * * 1-5');
		await expect(explanation(page)).toContainText('06:30');
		await expect(explanation(page)).toContainText('Monday through Friday');
	});

	test('reports a bad expression without pretending it works', async ({ page }) => {
		await setExpression(page, '0 0 31 2 *');
		await expect(explanation(page)).toContainText('never occurs');
		await expect(page.locator('[aria-labelledby="next-runs-heading"]')).toContainText(
			'Enter a valid expression'
		);
	});

	test('computes run times in the browser, not at build time', async ({ page }) => {
		// The route is prerendered, so the server pass renders a placeholder. Seeing real dates
		// here is what proves the clock is read on the client.
		const runs = page.locator('[aria-labelledby="next-runs-heading"] time');
		await expect(runs.first()).toBeVisible();
		await expect(page.locator('[aria-labelledby="next-runs-heading"]')).not.toContainText(
			'Calculating'
		);

		const first = await runs.first().getAttribute('datetime');
		expect(new Date(first!).getTime()).toBeGreaterThan(Date.now() - 60_000);
	});

	test('selects a field in the input when its card is clicked', async ({ page }) => {
		await card(page, 'hour').click();

		const selection = await input(page).evaluate((el: HTMLInputElement) =>
			el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0)
		);
		expect(selection).toBe('9-17');
		await expect(legend(page)).toContainText('Hour');
	});

	test('keeps the legend open while moving between fields', async ({ page }) => {
		// Clicking a card blurs the input. A focus-driven panel would collapse and reopen on
		// every switch, which is the flicker this guards against.
		await card(page, 'minute').click();
		await expect(legend(page)).toBeVisible();

		for (const field of ['day of week', 'hour', 'month']) {
			await card(page, field).click();
			await expect(legend(page)).toBeVisible();
		}
		await expect(legend(page)).toContainText('Month');
	});

	test('puts the legend away when focus leaves the editor', async ({ page }) => {
		await card(page, 'month').click();
		await expect(legend(page)).toBeVisible();

		await page.locator('h1').first().click();
		await expect(legend(page)).toBeHidden();
	});

	test('warns about a valid schedule that will not do what it looks like', async ({ page }) => {
		const warnings = page.locator('[aria-label="Schedule warnings"]');
		await expect(warnings).toBeHidden();

		// Valid cron, but the step leaves a four-minute gap across the hour boundary.
		await setExpression(page, '*/7 * * * *');
		await expect(warnings).toContainText('does not divide the hour evenly');
		await expect(warnings).toContainText('4 minutes');
	});

	test('copies the expression to the clipboard', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.getByRole('button', { name: /copy expression/i }).click();

		await expect(page.getByRole('button', { name: /expression copied/i })).toBeVisible();
		const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toBe('*/15 9-17 * * 1-5');
	});

	test('loads an example from the list', async ({ page }) => {
		await page.getByRole('button', { name: /0 3 \* \* 0/ }).click();
		await expect(input(page)).toHaveValue('0 3 * * 0');
		await expect(explanation(page)).toContainText('Sunday');
	});
});

test.describe('dialects', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(ROUTE);
		await waitForPageLoad(page);
	});

	test('reads the same six fields differently per dialect', async ({ page }) => {
		// The reason the selector exists: seconds-first and EventBridge disagree about this.
		await page.getByRole('radio', { name: /AWS EventBridge/i }).click();
		await setExpression(page, '0 18 ? * MON-FRI *');
		await expect(explanation(page)).toContainText('06:00 PM');

		await page.getByRole('radio', { name: /^Seconds/ }).click();
		// Same text, different dialect: the month field is where MON-FRI now lands.
		await expect(explanation(page)).toContainText('does not accept');
	});

	test('shows a year field and a sixth card under EventBridge', async ({ page }) => {
		await page.getByRole('radio', { name: /AWS EventBridge/i }).click();
		await expect(card(page, 'year')).toBeVisible();
		await expect(card(page, 'second')).toBeHidden();
	});

	test('numbers day-of-week from Sunday under EventBridge', async ({ page }) => {
		await page.getByRole('radio', { name: /AWS EventBridge/i }).click();
		await setExpression(page, '0 12 ? * 1 *');
		await expect(explanation(page)).toContainText('Sunday');

		await page.getByRole('radio', { name: /Unix/i }).click();
		await setExpression(page, '0 12 * * 1');
		await expect(explanation(page)).toContainText('Monday');
	});

	test('swaps the example list with the dialect', async ({ page }) => {
		const heading = page.locator('#examples-heading');
		await expect(heading).toContainText('Unix');

		await page.getByRole('radio', { name: /^Seconds/ }).click();
		await expect(heading).toContainText('Seconds');
		await expect(page.getByRole('button', { name: /^\*\/30 \* \* \* \* \*/ })).toBeVisible();

		await page.getByRole('radio', { name: /AWS EventBridge/i }).click();
		await expect(heading).toContainText('AWS EventBridge');
	});

	test('schedules sub-minute runs and shows the seconds', async ({ page }) => {
		await page.getByRole('radio', { name: /^Seconds/ }).click();
		await setExpression(page, '*/30 * * * * *');
		await expect(explanation(page)).toContainText('30 seconds');

		// Without seconds in the format, two consecutive runs would render identically.
		const runs = page.locator('[aria-labelledby="next-runs-heading"] time');
		const first = await runs.nth(0).textContent();
		const second = await runs.nth(1).textContent();
		expect(first).not.toBe(second);
		expect(first).toMatch(/\d{2}:\d{2}:\d{2}/);
	});
});
