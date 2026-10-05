/**
 * A minimal stand-in for SvelteKit's `$app/paths` virtual module, aliased in for component
 * tests (vitest.config.ts) — vitest doesn't load the `sveltekit()` Vite plugin that normally
 * provides this module, so any component importing `$app/paths` needs something real to
 * resolve to. `base` matches this app's dev-mode value (see svelte.config.js): empty, since
 * the `/tools` base path only applies to production builds.
 */
export const base = '';
export const assets = '';
export function resolveRoute(id: string): string {
	return id;
}
