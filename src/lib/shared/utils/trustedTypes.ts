/**
 * A single, named Trusted Types policy (`devx-html`) for the one place in this app that sets
 * `innerHTML` directly, outside of Svelte's own `{@html}` handling: the markdown editor's PDF
 * export (Toolbar.svelte), which builds an offscreen container from already-sanitized markdown
 * HTML (see `markdownParser.ts`) plus a static, developer-authored `<style>` block.
 *
 * This is a *named* policy, not the special `default` policy — Trusted Types only auto-applies
 * a `default` policy to sinks that don't explicitly request one, and Svelte compiles `{@html}`
 * to its own Trusted-Types-aware handling, so naming this policy keeps the two from ever
 * interacting: this module's sanitizer only ever runs for content that passes through
 * `setInnerHTML` below, nothing else on the page.
 *
 * The sanitizer here is deliberately conservative rather than a general-purpose HTML sanitizer
 * (that job belongs to `markdownParser.ts`'s `rehype-sanitize` pass, upstream of this): it
 * exists as a second layer, so a future gap in that upstream sanitizer — or a future caller of
 * `setInnerHTML` with less-trusted input — doesn't reach the DOM unfiltered.
 */

const POLICY_NAME = 'devx-html';

/** Elements that can execute code or load external resources; never allowed through. */
const DANGEROUS_TAGS = new Set([
	'SCRIPT',
	'IFRAME',
	'OBJECT',
	'EMBED',
	'LINK',
	'META',
	'BASE',
	'FORM'
]);

/** URL-bearing attributes worth checking for a `javascript:`-style scheme. */
const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'xlink:href']);

const UNSAFE_URL_SCHEME = /^\s*(javascript|vbscript|data:text\/html)/i;

/**
 * Strip anything that can execute script or navigate to a script-executing URL.
 *
 * Parses via `DOMParser` rather than assigning to `.innerHTML` directly — `DOMParser` builds a
 * detached, inert document without running scripts or triggering the Trusted Types sink this
 * function is defining a policy for, so there's no risk of the policy recursing into itself.
 *
 * `text/html` parsing hoists a handful of tags (`<style>`, `<title>`, `<meta>`, `<link>`,
 * `<base>`) into the parsed document's `<head>` even for a body-only fragment, which matters
 * here because the PDF export wraps its content in a leading `<style>` block — so both `head`
 * and `body` are walked and recombined, not just `body`.
 */
export function sanitizeHtml(html: string): string {
	const doc = new DOMParser().parseFromString(String(html), 'text/html');

	for (const root of [doc.head, doc.body]) {
		for (const tag of DANGEROUS_TAGS) {
			for (const el of Array.from(root.getElementsByTagName(tag))) {
				el.remove();
			}
		}

		for (const el of Array.from(root.querySelectorAll('*'))) {
			for (const attr of Array.from(el.attributes)) {
				const name = attr.name.toLowerCase();
				if (name.startsWith('on')) {
					el.removeAttribute(attr.name);
				} else if (URL_ATTRIBUTES.has(name) && UNSAFE_URL_SCHEME.test(attr.value)) {
					el.removeAttribute(attr.name);
				}
			}
		}
	}

	return doc.head.innerHTML + doc.body.innerHTML;
}

let policy: { createHTML: (html: string) => string } | undefined;

function getPolicy() {
	if (typeof window === 'undefined' || !window.trustedTypes?.createPolicy) {
		return undefined;
	}
	if (!policy) {
		try {
			policy = window.trustedTypes.createPolicy(POLICY_NAME, { createHTML: sanitizeHtml });
		} catch {
			// A policy by this name may already exist (e.g. hot-reload during dev); nothing to
			// recover here beyond falling back to the unguarded path below.
		}
	}
	return policy;
}

/**
 * Safely set `innerHTML`, always through the sanitizer above.
 *
 * There is no "assign the raw string" fallback: if Trusted Types isn't available (an older
 * browser) the sanitizer still runs, just without the browser also enforcing that nothing else
 * on the page bypasses it — the content reaching the DOM is filtered either way.
 */
export function setInnerHTML(element: HTMLElement, html: string): void {
	if (typeof window === 'undefined') return; // SSR

	const activePolicy = getPolicy();
	element.innerHTML = activePolicy ? activePolicy.createHTML(html) : sanitizeHtml(html);
}
