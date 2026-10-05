import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	// Use existing server if running, otherwise start one
	webServer: process.env.CI
		? {
				command: 'pnpm build && pnpm preview',
				port: 4173,
				reuseExistingServer: false,
				timeout: 120 * 1000
			}
		: {
				command: 'pnpm dev',
				port: 5173,
				reuseExistingServer: true,
				timeout: 120 * 1000
			},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
		// Uncomment to test on more browsers (increases test count)
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] }
		// },
		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] }
		// },
		// {
		// 	name: 'Mobile Chrome',
		// 	use: { ...devices['Pixel 5'] }
		// },
		// {
		// 	name: 'Mobile Safari',
		// 	use: { ...devices['iPhone 12'] }
		// }
	],
	// Timeout for each test
	timeout: 30000,
	// Retry failed tests
	retries: process.env.CI ? 2 : 0,
	// Run tests in parallel
	workers: process.env.CI ? 1 : undefined,
	// Reporter configuration
	reporter: [
		['html'],
		['list']
	]
});
