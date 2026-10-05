import { describe, expect, it } from 'vitest';
import { sanitizeHtml, setInnerHTML } from './trustedTypes';

describe('sanitizeHtml', () => {
	it('removes script tags', () => {
		expect(sanitizeHtml('<p>hi</p><script>alert(1)</script>')).not.toContain('<script');
	});

	it('removes iframe, object and embed elements', () => {
		const html =
			'<iframe src="https://evil.example"></iframe>' +
			'<object data="x.swf"></object>' +
			'<embed src="x.swf" />';
		const out = sanitizeHtml(html);
		expect(out).not.toContain('<iframe');
		expect(out).not.toContain('<object');
		expect(out).not.toContain('<embed');
	});

	it('removes inline event handler attributes', () => {
		const out = sanitizeHtml('<img src="x.png" onerror="alert(1)" alt="x" />');
		expect(out).not.toContain('onerror');
		expect(out).toContain('src="x.png"');
	});

	it('removes javascript: URLs from href and src', () => {
		const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
		expect(out).not.toContain('javascript:');
	});

	it('removes data:text/html URLs', () => {
		const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
		expect(out).not.toContain('data:text/html');
	});

	it('keeps a normal https URL intact', () => {
		const out = sanitizeHtml('<a href="https://example.com">link</a>');
		expect(out).toContain('href="https://example.com"');
	});

	it('preserves a leading <style> block (hoisted into <head> by HTML parsing)', () => {
		const html = '<style>#x { color: red; }</style><p id="x">hello</p>';
		const out = sanitizeHtml(html);
		expect(out).toContain('#x { color: red; }');
		expect(out).toContain('<p id="x">hello</p>');
	});

	it('leaves plain, safe markup unchanged in substance', () => {
		const html = '<h1>Title</h1><p>Some <strong>bold</strong> text.</p>';
		const out = sanitizeHtml(html);
		expect(out).toContain('<h1>Title</h1>');
		expect(out).toContain('<strong>bold</strong>');
	});
});

describe('setInnerHTML', () => {
	it('sets sanitized content on the target element', () => {
		const el = document.createElement('div');
		setInnerHTML(el, '<p>safe</p><script>alert(1)</script>');

		expect(el.innerHTML).toContain('<p>safe</p>');
		expect(el.innerHTML).not.toContain('<script');
	});

	it('strips an event handler before it reaches the live element', () => {
		const el = document.createElement('div');
		setInnerHTML(el, '<img src="x.png" onerror="alert(1)" />');

		expect(el.querySelector('img')?.getAttribute('onerror')).toBeNull();
	});
});
