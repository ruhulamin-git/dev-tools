import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [svelte(), svelteTesting(), tailwindcss()],
	resolve: {
		alias: {
			$lib: path.resolve(root, 'src/lib'),
			// SvelteKit's own Vite plugin (which supplies the real $app/* virtual modules) isn't
			// loaded here — only the plain Svelte plugin is, to keep component tests fast and
			// SvelteKit-router-agnostic. Any component importing $app/paths needs something real
			// to resolve to; see src/test-stubs/app-paths.ts for what it provides.
			'$app/paths': path.resolve(root, 'src/test-stubs/app-paths.ts'),
			'$app/state': path.resolve(root, 'src/test-stubs/app-state.ts')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// The plugins/ directory is a read-only snapshot of the two editor plugins. Their
		// tests belong to their own repositories and run under their own config; picked up
		// here they would resolve imports like @devxhub/cron-core against this app and fail.
		exclude: ['**/node_modules/**', 'src/routes/cron-expression-generator/plugins/**'],
		globals: true,
		environment: 'jsdom'
	}
});
