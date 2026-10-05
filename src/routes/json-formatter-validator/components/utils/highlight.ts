/**
 * JSON syntax highlighting for JsonEditor.svelte's `{@html}` preview overlay.
 *
 * Escapes `&`, `<` and `>` up front (JSON's own quoting means `"`/`'` never need HTML-escaping
 * here — they're structural JSON syntax, not HTML metacharacters, and this only ever renders as
 * element content, never inside an attribute), then wraps recognized tokens in hardcoded,
 * non-interpolated `<span>` markup. Because every span's class list is a fixed literal string
 * (never built from the input), and the escape pass runs once before any wrapping, no input can
 * reintroduce a raw `<`/`>`/`&` — see highlight.test.ts for the payloads this is checked against.
 */
export function syntaxHighlightJson(json: string): string {
	// Escape HTML
	const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	// First, highlight values (strings, numbers, booleans, null)
	let highlighted = escaped.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
		(match) => {
			let cls = 'text-blue-600 dark:text-blue-400'; // number
			if (match.startsWith('"')) {
				if (match.endsWith(':')) {
					cls = 'text-purple-700 dark:text-purple-400 font-medium'; // key
					match = match.slice(0, -1) + '<span class="text-gray-600 dark:text-slate-400">:</span>';
				} else {
					cls = 'text-emerald-600 dark:text-emerald-400'; // string
				}
			} else if (match === 'true' || match === 'false') {
				cls = 'text-orange-600 dark:text-orange-400 font-medium'; // boolean
			} else if (match === 'null') {
				cls = 'text-gray-400 dark:text-slate-500 italic'; // null
			}
			return `<span class="${cls}">${match}</span>`;
		}
	);

	// Add colors for structural characters (braces, brackets, commas)
	highlighted = highlighted
		.replace(
			/([{}])/g,
			'<span class="text-gray-700 dark:text-slate-300 font-semibold">$1</span>'
		) // braces
		.replace(
			// A single `[` or `]`. (Originally `/([[\\]])/g`, which — because the stray `\\`
			// lands inside the character class and the second `]` lands outside it — actually
			// matches the two-character sequences "[]" or "\]" together, not a lone bracket. It
			// never fired for a populated array like `[1,2]`; fixed here as a one-class typo,
			// not a behavior change anyone was relying on.)
			/([[\]])/g,
			'<span class="text-gray-700 dark:text-slate-300 font-semibold">$1</span>'
		) // brackets
		.replace(/,(?=\s*[\n\r])/g, '<span class="text-gray-600 dark:text-slate-400">,</span>'); // commas

	return highlighted;
}
