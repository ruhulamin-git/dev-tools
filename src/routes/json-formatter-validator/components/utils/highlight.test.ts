import { describe, expect, it } from 'vitest';
import { syntaxHighlightJson } from './highlight';

describe('syntaxHighlightJson', () => {
	it('cannot inject a live element from a string value', () => {
		const out = syntaxHighlightJson('{"name": "<img src=x onerror=alert(1)>"}');
		const doc = new DOMParser().parseFromString(out, 'text/html');

		expect(doc.querySelector('img')).toBeNull();
		expect(doc.querySelector('[onerror]')).toBeNull();
	});

	it('cannot break out via a key containing a script tag', () => {
		const out = syntaxHighlightJson('{"<\\/script><script>alert(1)</script>": 1}');
		const doc = new DOMParser().parseFromString(out, 'text/html');

		expect(doc.querySelector('script')).toBeNull();
	});

	it('highlights strings, numbers, booleans and null', () => {
		const out = syntaxHighlightJson('{"a": "x", "b": 1, "c": true, "d": null}');

		expect(out).toContain('text-emerald-600');
		expect(out).toContain('text-blue-600');
		expect(out).toContain('text-orange-600');
		expect(out).toContain('text-gray-400');
	});

	it('highlights a lone bracket in a populated array', () => {
		// Regression check for the pre-existing regex that only matched the two-character
		// sequences "[]" or "\]" together, so a bracket in a populated array like `[1,2]` was
		// never colored at all.
		const out = syntaxHighlightJson('[1,2]');
		const matches = out.match(/text-gray-700 dark:text-slate-300 font-semibold">\[/);

		expect(matches).not.toBeNull();
	});

	it('renders plain JSON structure untouched in substance', () => {
		const doc = new DOMParser().parseFromString(
			syntaxHighlightJson('{"key": "value"}'),
			'text/html'
		);
		expect(doc.body.textContent).toContain('"key"');
		expect(doc.body.textContent).toContain('"value"');
	});
});
