// @ts-check
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Add base path for subpath deployment
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/tools' : ''
		},
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '200.html',
			// Pre-generates .gz/.br alongside every asset at build time, so nginx's
			// `gzip_static on` (docker/nginx.conf) can serve the compressed file directly
			// instead of spending CPU compressing it on every request.
			precompress: true
		}),
		// Optimize preloading strategy to reduce critical request chains
		prerender: {
			entries: ['*'],
			handleHttpError: 'warn',
			handleMissingId: 'warn' // Don't fail on missing IDs
		}
	},

	compilerOptions: {
		runes: true
	}
};
export default config;