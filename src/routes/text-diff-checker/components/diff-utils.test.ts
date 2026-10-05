import { describe, expect, it } from 'vitest';
import { escapeHtml, syntaxHighlight } from './diff-utils';

describe('escapeHtml', () => {
	it('escapes the five characters that matter for HTML/attribute contexts', () => {
		expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#039;');
	});

	it('leaves plain text unchanged', () => {
		expect(escapeHtml('plain text 123')).toBe('plain text 123');
	});
});

describe('syntaxHighlight', () => {
	// syntaxHighlight escapes the raw input via escapeHtml *before* running any of its
	// tag-wrapping regexes, so every regex only ever operates on already-escaped text and
	// only ever re-embeds that escaped text back inside a hardcoded <span> — a diff line
	// containing literal `<`/`>`/`&` can never reach the DOM as live markup.
	it('cannot inject a live element from a line of diffed content', () => {
		// The highlighter's job is to *display* diffed code as text, including a line that
		// happens to look like an HTML tag — so this renders as visible, escaped text (a real
		// `<img onerror=...>` would be a strange thing to see in a diff, but it must never
		// become a live element or a live attribute).
		const out = syntaxHighlight('<img src=x onerror=alert(1)>');

		expect(out).not.toContain('<img');

		const doc = new DOMParser().parseFromString(out, 'text/html');
		expect(doc.querySelector('img')).toBeNull();
		expect(doc.querySelector('[onerror]')).toBeNull();
	});

	it('cannot break out of a span via a quoted string value', () => {
		// A crafted "string literal" that looks like it wants to close the span early.
		const out = syntaxHighlight(`const x = '</span><script>alert(1)</script>';`);

		const doc = new DOMParser().parseFromString(out, 'text/html');
		expect(doc.querySelector('script')).toBeNull();
	});

	it('still highlights keywords, strings and numbers', () => {
		const out = syntaxHighlight(`const x = 42; // comment`);

		expect(out).toContain('text-purple-600">const</span>');
		expect(out).toContain('text-orange-500">42</span>');
		expect(out).toContain('text-slate-400">// comment</span>');
	});
});
