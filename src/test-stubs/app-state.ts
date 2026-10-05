/**
 * A minimal stand-in for SvelteKit's `$app/state` virtual module (see app-paths.ts for why this
 * is needed at all under vitest). Only `page.url` is provided — the one part of the real
 * `page` object components in this app actually read — backed by the test environment's real
 * `window.location`, so a test can control it the normal way (`vi.stubGlobal` or navigating
 * jsdom's location) rather than through a SvelteKit-specific API that isn't present here.
 */
export const page = {
	get url() {
		return new URL(window.location.href);
	}
};
