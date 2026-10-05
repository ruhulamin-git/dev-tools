import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdownParser';

describe('parseMarkdown — XSS payload corpus', () => {
	it('strips a raw <script> tag', async () => {
		const out = await parseMarkdown('Hello <script>alert(document.cookie)</script> world');
		expect(out).not.toContain('<script');
		expect(out).not.toContain('alert(document.cookie)');
	});

	it('strips an onerror handler on an <img>', async () => {
		const out = await parseMarkdown('<img src="x.png" onerror="alert(1)">');
		expect(out).not.toContain('onerror');
	});

	it('strips a javascript: URL in a markdown link', async () => {
		const out = await parseMarkdown('[click me](javascript:alert(1))');
		expect(out).not.toContain('javascript:');
	});

	it('strips a javascript: URL in a raw <a> tag', async () => {
		const out = await parseMarkdown('<a href="javascript:alert(1)">click</a>');
		expect(out).not.toContain('javascript:');
	});

	it('strips an <iframe>', async () => {
		const out = await parseMarkdown('<iframe src="https://evil.example/"></iframe>');
		expect(out).not.toContain('<iframe');
	});

	it('strips a <video> or <audio> tag (external-request vector, not needed here)', async () => {
		const out = await parseMarkdown(
			'<video src="https://evil.example/track.mp4" autoplay></video>' +
				'<audio src="https://evil.example/track.mp3" autoplay></audio>'
		);
		expect(out).not.toContain('<video');
		expect(out).not.toContain('<audio');
	});

	it('strips an inline style attribute (CSS-injection surface)', async () => {
		const out = await parseMarkdown(
			'<div style="background: url(https://evil.example/leak)">x</div>'
		);
		expect(out).not.toContain('style=');
		expect(out).not.toContain('evil.example');
	});

	it('strips an SVG-based script vector', async () => {
		const out = await parseMarkdown('<svg onload="alert(1)"></svg>');
		expect(out).not.toContain('onload');
	});

	it('forces a safe rel on every link, overriding an attacker-supplied rel', async () => {
		const out = await parseMarkdown('<a href="https://example.com" rel="opener">link</a>');
		expect(out).toContain('rel="noopener noreferrer nofollow"');
		expect(out).not.toContain('rel="opener"');
	});

	it('keeps a plain https link intact, with the forced rel added', async () => {
		const out = await parseMarkdown('[Devxhub](https://www.devxhub.com)');
		expect(out).toContain('href="https://www.devxhub.com"');
		expect(out).toContain('rel="noopener noreferrer nofollow"');
	});

	it('keeps a base64 image data URI (legitimate use)', async () => {
		const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
		const out = await parseMarkdown(`![alt](${dataUri})`);
		expect(out).toContain(dataUri);
	});

	it('does not fall through to a live handler on a malformed payload', async () => {
		// Malformed/truncated raw HTML like this doesn't get parsed as an element at all — it
		// falls back to escaped plain text (visibly showing the broken tag to the reader) — but
		// what matters for safety is that no *live* onerror handler or script tag exists in the
		// resulting DOM, whatever text is visible.
		const out = await parseMarkdown('<img src=x onerror=alert(1)//<script>alert(2)</script>');
		const doc = new DOMParser().parseFromString(out, 'text/html');

		expect(doc.querySelector('[onerror]')).toBeNull();
		expect(doc.querySelector('script')).toBeNull();
	});

	it('renders normal markdown formatting untouched', async () => {
		const out = await parseMarkdown('# Title\n\nSome **bold** and _italic_ text.');
		expect(out).toContain('<h1>Title</h1>');
		expect(out).toContain('<strong>bold</strong>');
		expect(out).toContain('<em>italic</em>');
	});

	it('keeps prism syntax-highlighting classes on code blocks', async () => {
		const out = await parseMarkdown('```js\nconst x = 1;\n```');
		expect(out).toContain('language-js');
	});
});
