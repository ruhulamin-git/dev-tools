import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';

// A minimal shape for the hast nodes `enforceLinkRel` walks — narrower than pulling in the
// `hast` types package for one small helper, but enough to type the tagName/properties/children
// access below.
interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

// Extended schema to allow prism classes and common markdown elements.
//
// Everything not explicitly listed here falls back to hast-util-sanitize's own defaultSchema,
// which already does useful work we rely on: it restricts `href`/`src` to a safe protocol list
// (so `javascript:`/`vbscript:` links are rejected regardless of what we add below) and prefixes
// user-supplied `id`/`name` values with `user-content-` (clobberPrefix) to stop DOM-clobbering
// attacks. We only narrow or extend it where the defaults don't fit this editor.
const sanitizeSchema: typeof defaultSchema = {
	...defaultSchema,
	tagNames: [
		...(defaultSchema.tagNames || []),
		// Ensure headings are included
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		// Common elements — no <video>/<audio>/<map>/<area>/<track>/<source>: none of them are
		// things a markdown document legitimately needs, and every one of them can trigger an
		// automatic request to an attacker-controlled URL just by being rendered (a classic
		// exfiltration and tracking-pixel vector), which `<img>` alone can already do but is at
		// least an expected, visible part of markdown.
		'span',
		'div',
		'section',
		'article',
		'aside',
		'header',
		'footer',
		'nav',
		'main',
		'figure',
		'figcaption',
		'details',
		'summary',
		'mark',
		'time',
		'abbr',
		'cite',
		'dfn',
		'kbd',
		'samp',
		'var',
		'ruby',
		'rt',
		'rp',
		'bdi',
		'bdo',
		'wbr',
		'data',
		'meter',
		'progress',
		'output',
		'picture',
		// Tables
		'table',
		'caption',
		'colgroup',
		'col',
		'tbody',
		'thead',
		'tfoot',
		'tr',
		'td',
		'th',
		// Code
		'pre',
		'code'
	],
	attributes: {
		...defaultSchema.attributes,
		// No `style`: an inline style attribute is a CSS-injection surface (background-image
		// based data exfiltration, clickjacking overlays via position/z-index) that nothing in
		// this editor's output needs — code highlighting is done entirely through the
		// allowlisted `className` tokens below, not inline styles.
		'*': ['className', 'class', 'id'],
		code: [...(defaultSchema.attributes?.code || []), ['className', /^language-./], 'class'],
		pre: [...(defaultSchema.attributes?.pre || []), ['className', /^language-./], 'class'],
		span: [['className', /^(token|line-number|code-line|highlight-line).*/], 'class'],
		div: ['className', 'class'],
		a: ['href', 'title', 'target', 'rel', 'className', 'class'],
		img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'className', 'class'],
		table: ['className', 'class'],
		th: ['scope', 'colspan', 'rowspan', 'className', 'class'],
		td: ['colspan', 'rowspan', 'className', 'class'],
		input: ['type', 'checked', 'disabled', 'className', 'class']
	},
	protocols: {
		...defaultSchema.protocols,
		// Narrower than the defaults (which also allow irc(s): and xmpp:, unused here) and,
		// for `src`, explicitly including `data:` so a pasted base64 image keeps working. This
		// is scheme-level, not MIME-level — hast-util-sanitize doesn't parse the data URI's
		// declared type — but that's fine specifically for `src`, since it's only ever read by
		// `<img>` in this schema, and a browser rendering an `<img>` never executes a `data:`
		// payload as HTML/script regardless of what MIME type it claims to be.
		href: ['http', 'https', 'mailto'],
		src: ['http', 'https', 'data']
	}
};

/**
 * Force a safe `rel` on every link, regardless of what the author wrote.
 *
 * A sanitize schema can only filter which attributes/values are *allowed* through — it can't
 * synthesize a value that wasn't there, so `rel="noopener noreferrer nofollow"` has to be
 * applied as a small separate pass after sanitizing. `noopener`/`noreferrer` close the
 * `window.opener` tab-nabbing hole a `target="_blank"` link (allowed by the schema above,
 * since a legitimate document link might want it) would otherwise leave open; `nofollow` is a
 * reasonable default for links inside user-authored content this editor didn't vet.
 */
function enforceLinkRel() {
	return (tree: HastNode) => {
		const visit = (node: HastNode) => {
			if (!node.children) return;
			for (const child of node.children) {
				if (child.type === 'element') {
					if (child.tagName === 'a') {
						child.properties = {
							...child.properties,
							rel: ['noopener', 'noreferrer', 'nofollow']
						};
					}
					visit(child);
				}
			}
		};
		visit(tree);
	};
}

export async function parseMarkdown(content: string): Promise<string> {
	try {
		const file = await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkRehype, { allowDangerousHtml: true })
			// remark-rehype's `allowDangerousHtml` keeps literal HTML tags as opaque `raw` text
			// nodes, not `element` nodes — rehype-raw parses those into real elements so
			// rehype-sanitize can actually inspect their tag/attributes below. Without it, every
			// `raw` node is simply dropped by the sanitizer wholesale (safe, but it silently
			// breaks the raw-HTML tags — <details>, <table>, etc. — the schema below allows for).
			.use(rehypeRaw)
			.use(rehypeSanitize, sanitizeSchema)
			.use(enforceLinkRel)
			.use(rehypePrism, { showLineNumbers: true, ignoreMissing: true })
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(content);

		return String(file);
	} catch (e) {
		console.error('Markdown parsing error:', e);
		return '<p class="text-red-500">Error parsing markdown.</p>';
	}
}
