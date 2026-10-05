// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		// Most pushes are plain event objects ({ event: 'x', ... }, from track()). Google
		// Consent Mode commands (consent.ts) are the one exception GTM itself expects in this
		// shape: a positional array mirroring gtag()'s own `arguments` — ['consent', 'update',
		// {...}] — not an object.
		dataLayer: (Record<string, unknown> | unknown[])[];
		// Trusted Types isn't yet in TypeScript's bundled DOM lib. Typed minimally, matching
		// only what this app actually calls — see src/lib/shared/utils/trustedTypes.ts.
		trustedTypes?: {
			createPolicy(
				name: string,
				policy: { createHTML: (html: string) => string }
			): { createHTML: (html: string) => string };
		};
	}
}

export {};
