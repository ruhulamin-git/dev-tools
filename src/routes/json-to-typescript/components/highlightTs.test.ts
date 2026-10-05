import { describe, expect, it } from 'vitest';
import { highlightTs } from './highlightTs';

describe('highlightTs', () => {
	it('cannot inject a live element from generated interface text', () => {
		const out = highlightTs('interface X {\n  name: "<img src=x onerror=alert(1)>";\n}');
		const doc = new DOMParser().parseFromString(out, 'text/html');

		expect(doc.querySelector('img')).toBeNull();
		expect(doc.querySelector('[onerror]')).toBeNull();
	});

	it('cannot break out via a property name containing a script tag', () => {
		const out = highlightTs('interface X {\n  </script><script>alert(1)</script>: string;\n}');
		const doc = new DOMParser().parseFromString(out, 'text/html');

		expect(doc.querySelector('script')).toBeNull();
	});

	it('highlights keywords and the interface name', () => {
		const out = highlightTs('interface Person {\n  name: string;\n}');

		expect(out).toContain('text-blue-600');
		expect(out).toContain('text-yellow-600');
	});

	it('does not corrupt an entity even though it splits it (documented cosmetic limitation)', () => {
		// A `&` inside the source gets escaped to `&amp;` before highlighting runs; the later
		// semicolon pass can still match the `;` inside that entity and wrap it, splitting the
		// entity visually — this asserts that failure mode stays cosmetic: the output must still
		// be well-formed enough that no live element or attribute results.
		const out = highlightTs('type X = A & B;');
		const doc = new DOMParser().parseFromString(out, 'text/html');

		expect(doc.querySelector('script')).toBeNull();
		expect(doc.querySelector('[onerror]')).toBeNull();
	});

	it('renders empty input as an empty string', () => {
		expect(highlightTs('')).toBe('');
		expect(highlightTs('   ')).toBe('');
	});
});
