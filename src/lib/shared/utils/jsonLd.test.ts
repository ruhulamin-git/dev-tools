import { describe, expect, it } from 'vitest';
import { escapeJsonForScriptTag, toJsonLdScript } from './jsonLd';

describe('escapeJsonForScriptTag', () => {
	it('escapes angle brackets so a closing script tag cannot appear literally', () => {
		const json = JSON.stringify({ name: '</script><img src=x onerror=alert(1)>' });
		const escaped = escapeJsonForScriptTag(json);

		expect(escaped).not.toContain('</script>');
		expect(escaped).not.toContain('<');
		expect(escaped).not.toContain('>');
		expect(JSON.parse(escaped)).toEqual({
			name: '</script><img src=x onerror=alert(1)>'
		});
	});

	it('escapes ampersands', () => {
		const json = JSON.stringify({ name: 'Tom & Jerry' });
		expect(escapeJsonForScriptTag(json)).not.toContain('&');
	});

	it('escapes U+2028 and U+2029 line/paragraph separators', () => {
		const json = JSON.stringify({ name: 'line break here' });
		const escaped = escapeJsonForScriptTag(json);

		expect(escaped).not.toContain(' ');
		expect(escaped).not.toContain(' ');
		expect(JSON.parse(escaped)).toEqual({ name: 'line break here' });
	});

	it('round-trips a payload with no special characters unchanged in meaning', () => {
		const json = JSON.stringify({ name: 'Plain Tool', price: 0 });
		expect(JSON.parse(escapeJsonForScriptTag(json))).toEqual({ name: 'Plain Tool', price: 0 });
	});
});

describe('toJsonLdScript', () => {
	it('wraps a single object in one script tag with the correct type', () => {
		const html = toJsonLdScript({ '@type': 'Thing', name: 'Widget' });

		expect(html).toContain('<script type="application/ld+json">');
		expect(html.match(/<script/g)).toHaveLength(1);
	});

	it('emits one script tag per entry when given an array', () => {
		const html = toJsonLdScript([{ '@type': 'A' }, { '@type': 'B' }, { '@type': 'C' }]);

		expect(html.match(/<script/g)).toHaveLength(3);
	});

	it('an attacker-controlled field cannot break out of the script tag into live markup', () => {
		// The classic JSON-LD injection payload: a value that closes the script tag and opens
		// a new, executable element right after it.
		const payload = {
			'@type': 'SoftwareApplication',
			name: '</script><script>alert(document.cookie)</script>'
		};

		const html = toJsonLdScript(payload);

		// Only the one legitimate opening/closing pair the component itself wrote should exist.
		expect(html.match(/<script[ >]/g)).toHaveLength(1);
		expect(html.match(/<\/script>/g)).toHaveLength(1);
		expect(html).not.toContain('alert(document.cookie)</script>');
	});

	it('escapes a double-quote breakout attempt inside a string value', () => {
		const payload = { description: '","@type":"Injected' };
		const html = toJsonLdScript(payload);

		// JSON.stringify already escapes the quote; parsing the emitted JSON must still yield
		// the original single field, not two fields (which would mean the quote escaped).
		const jsonText = html.replace(/^.*<script type="application\/ld\+json">/, '').replace(
			/<\/script>.*$/,
			''
		);
		expect(JSON.parse(jsonText)).toEqual(payload);
	});
});
