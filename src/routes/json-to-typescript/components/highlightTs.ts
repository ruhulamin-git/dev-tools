/**
 * Simple TypeScript syntax highlighting for TsCodeViewer.svelte's `{@html}` output display.
 *
 * Escapes `&`/`<`/`>` up front, then runs several sequential passes that each wrap a token
 * type in a hardcoded `<span>`. Because escaping always runs first and every span's class list
 * is a fixed literal string, no input can reintroduce a raw `<`/`>`/`&` — see
 * highlightTs.test.ts for the payloads this is checked against.
 *
 * Known cosmetic limitation, out of scope to redesign here: because later passes re-scan the
 * *output* of earlier passes (by design, for the "type name right after the `interface`/`type`
 * keyword" rule), an ampersand that was escaped to `&amp;` earlier can have its own trailing `;`
 * caught by the later semicolon-highlighting pass, splitting the entity apart in the rendered
 * output (visually wrong for an intersection type like `A & B`, though this generator's own
 * output never emits one). This is a display-correctness issue, not a safety one: it can only
 * ever mis-color or split already-escaped, inert text — it cannot produce a new live tag or
 * attribute, since no pass here builds a span from anything other than a fixed literal string.
 */
export function highlightTs(ts: string): string {
	if (!ts.trim()) return '';

	// Escape HTML first
	let escaped = ts.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	// Keywords (interface, type, etc.)
	escaped = escaped.replace(
		/\b(interface|type|extends|implements|export|import|from|const|let|var|function|class|enum|namespace|module|declare|readonly)\b/g,
		'<span class="text-blue-600 dark:text-blue-400 font-medium">$1</span>'
	);

	// Types (string, number, boolean, null, undefined, any, unknown, void, never)
	escaped = escaped.replace(
		/\b(string|number|boolean|null|undefined|any|unknown|void|never|object)\b/g,
		'<span class="text-emerald-600 dark:text-emerald-400">$1</span>'
	);

	// Property names (word followed by ? and :)
	escaped = escaped.replace(
		/(\s{2})(\w+)(\??)(:\s)/g,
		'$1<span class="text-purple-700 dark:text-purple-400 font-medium">$2</span><span class="text-orange-500 dark:text-orange-400">$3</span><span class="text-gray-600 dark:text-slate-400">$4</span>'
	);

	// Interface/Type names (after interface or type keyword, or as standalone types)
	escaped = escaped.replace(
		/(<span class="text-blue-600 dark:text-blue-400 font-medium">(?:interface|type)<\/span>\s+)(\w+)/g,
		'$1<span class="text-yellow-600 dark:text-yellow-400 font-semibold">$2</span>'
	);

	// Custom type references (PascalCase words that aren't keywords)
	escaped = escaped.replace(
		/:\s+([A-Z]\w*)\b(?!\s*[{=])/g,
		': <span class="text-yellow-600 dark:text-yellow-400">$1</span>'
	);

	// Array notation
	escaped = escaped.replace(
		/\[\]/g,
		'<span class="text-gray-700 dark:text-slate-300 font-semibold">[]</span>'
	);

	// Braces
	escaped = escaped.replace(
		/([{}])/g,
		'<span class="text-gray-700 dark:text-slate-300 font-semibold">$1</span>'
	);

	// Semicolons
	escaped = escaped.replace(/;/g, '<span class="text-gray-500 dark:text-slate-500">;</span>');

	// Equal sign for type aliases
	escaped = escaped.replace(/\s=\s/g, ' <span class="text-gray-600 dark:text-slate-400">=</span> ');

	return escaped;
}
