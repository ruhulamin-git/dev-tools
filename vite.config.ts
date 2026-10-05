import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	// Fail the production build rather than ship a form that posts a lead's name and email over
	// plain HTTP. Not enforced outside `production` so local dev can still point at an http
	// localhost API, the way PUBLIC_KHATMAH_BACKEND_URL already does for the Khatmah backend.
	if (mode === 'production') {
		const leadMagnetApiUrl = env.VITE_LEADMAGNET_API_URL;
		if (leadMagnetApiUrl && !leadMagnetApiUrl.startsWith('https://')) {
			throw new Error(
				`VITE_LEADMAGNET_API_URL must be an https:// URL in production (got "${leadMagnetApiUrl}"). ` +
					'The lead-magnet form sends a name and email address to this endpoint.'
			);
		}
	}

	return {
		plugins: [
			tailwindcss(),
			sveltekit(),
			// `ANALYZE=1 pnpm build` writes stats.html to the project root with a treemap of
			// what's actually in each chunk — off by default so a normal build doesn't pay for
			// the extra analysis pass.
			...(process.env.ANALYZE
				? [visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true, open: true })]
				: [])
		],
		build: {
			cssMinify: true,
			minify: 'esbuild',
			chunkSizeWarningLimit: 500,
			cssCodeSplit: true,
			// es2022 rather than esnext: esnext tracks whatever syntax the bundler's target
			// engine (Node, here) supports with zero downleveling, which can emit syntax too new
			// for still-common browsers. es2022 (top-level await, class fields, etc.) is broadly
			// supported by evergreen browsers while staying modern.
			target: 'es2022',
			modulePreload: {
				polyfill: false
			}
		},
		// Optimize dependencies
		optimizeDeps: {
			include: ['qrcode']
		},
		// SSR configuration - remove external qrcode since we need it in browser
		ssr: {
			noExternal: ['svelte-codemirror-editor', 'qrcode']
		}
	};
});
