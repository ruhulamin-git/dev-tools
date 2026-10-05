/**
 * Serialize schema.org data into `<script type="application/ld+json">` markup, safely.
 *
 * Every tool page used to hand-write `{@html \`<script type="application/ld+json">...\`}`
 * with the JSON typed directly into the template literal — unescaped, and on a few pages
 * built by interpolating values (tool names, URLs) straight into that string. A value
 * containing `</script>` would close the tag early and let whatever followed it be parsed
 * as live markup right next to it, and a stray `"` would break the JSON itself. This module
 * is the one place that builds that tag, so the escaping is written, and tested, once.
 */

// Built from character codes rather than embedded as literal source characters — U+2028/U+2029
// are themselves treated as line terminators by JS tooling, so writing them directly into this
// file risks the exact kind of subtle breakage this function exists to prevent.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * Escape the characters that are unsafe inside a `<script>` element's text content:
 * - `<` — so `</script>` (in any case or spacing) can never appear literally and close the tag.
 * - `>` and `&` — defensive; `>` matters if a consumer's HTML parser is lenient about the
 *   opening tag, `&` keeps the text from being read as an HTML entity by a non-JSON-LD reader.
 * - U+2028 / U+2029 — valid in JSON strings but illegal as raw line terminators in some JS
 *   parsing contexts; escaping them costs nothing here and avoids that class of bug entirely.
 *
 * Every escape is a `\uXXXX` sequence, which is valid inside a JSON string and decodes back to
 * the exact original character, so the payload's meaning is unchanged — only its byte-level
 * ability to prematurely close a `<script>` tag is removed.
 */
export function escapeJsonForScriptTag(json: string): string {
	return json
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.split(LINE_SEPARATOR)
		.join('\\u2028')
		.split(PARAGRAPH_SEPARATOR)
		.join('\\u2029');
}

/**
 * Build one or more `<script type="application/ld+json">` tags from plain schema.org objects.
 * Pass an array to emit several tags (a page may have both a SoftwareApplication and a
 * FAQPage schema, for instance).
 */
export function toJsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]): string {
	const entries = Array.isArray(data) ? data : [data];
	return entries
		.map((entry) => escapeJsonForScriptTag(JSON.stringify(entry)))
		.map((json) => `<script type="application/ld+json">${json}</script>`)
		.join('\n');
}
