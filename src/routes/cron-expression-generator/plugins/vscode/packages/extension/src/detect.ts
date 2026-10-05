import type { Dialect } from '@devxhub/cron-core';

/**
 * Finding cron expressions in text, with no dependency on VS Code.
 *
 * IntelliJ hands a plugin a parsed tree, so the equivalent code there can ask "is this scalar
 * the value of a `schedule:` key?" and get a real answer. VS Code hands us text, a language id
 * and a position, so detection here is line-shaped: a small set of rules per language, each
 * anchored on the key that introduces a schedule. That is less precise -- a `cron:` key nested
 * somewhere unrelated will match -- and the tradeoff is deliberate, because the cost of a
 * spurious hover is a tooltip nobody asked for, while the cost of a parser is a parser.
 *
 * Keeping this module free of `vscode` imports is what makes it testable: the editor module
 * only exists inside a running editor, so anything importing it can be tested only by mocking
 * the editor, and detection is the part most worth testing honestly.
 */
export interface Hit {
	readonly expression: string;
	readonly dialect: Dialect;
	/** Column at which `expression` starts on the line. */
	readonly start: number;
	readonly length: number;
}

interface Rule {
	readonly languages: readonly string[];
	/** Must expose a capture group named `expr`. */
	readonly pattern: RegExp;
	/** Resolved per match, because Terraform decides dialect from the value's own wrapper. */
	readonly dialect: (raw: string) => Dialect | null;
	/** Strips a wrapper such as AWS's `cron(...)`, returning the inner text and its offset. */
	readonly unwrap?: (raw: string) => { text: string; offset: number } | null;
}

const unix = () => 'unix' as const;

/** `cron(0 12 * * ? *)` as AWS writes it. `rate(5 minutes)` is not cron and yields null. */
function unwrapAws(raw: string): { text: string; offset: number } | null {
	const match = /^cron\((?<inner>[^)]*)\)$/.exec(raw.trim());
	const inner = match?.groups?.['inner'];
	if (inner === undefined) return null;
	return { text: inner, offset: raw.indexOf('(') + 1 };
}

const RULES: readonly Rule[] = [
	// GitHub Actions (`- cron: "0 3 * * *"`) and Kubernetes CronJobs (`schedule: "0 3 * * *"`).
	// Both are plain five-field Unix. The optional leading `-` covers the sequence-item form.
	{
		languages: ['yaml', 'github-actions-workflow'],
		pattern: /^\s*(?:-\s+)?(?:cron|schedule)\s*:\s*(?<quote>["']?)(?<expr>[^"'#]+?)\k<quote>\s*(?:#.*)?$/,
		dialect: unix
	},
	// Spring's @Scheduled, which counts seconds in a sixth leading field. Java and Kotlin write
	// the same annotation, and at the level of a line of text they are indistinguishable.
	{
		languages: ['java', 'kotlin'],
		pattern: /\bcron\s*=\s*"(?<expr>[^"]+)"/,
		dialect: () => 'seconds'
	},
	// Terraform EventBridge, where the value carries its own wrapper and `rate(...)` must not
	// be mistaken for a schedule we can explain.
	{
		languages: ['terraform', 'tf', 'hcl'],
		pattern: /\bschedule_expression\s*=\s*"(?<expr>[^"]+)"/,
		dialect: (raw) => (unwrapAws(raw) ? 'eventbridge' : null),
		unwrap: unwrapAws
	},
	// Terraform autoscaling recurrence, which is plain Unix and takes no wrapper.
	{
		languages: ['terraform', 'tf', 'hcl'],
		pattern: /\brecurrence\s*=\s*"(?<expr>[^"]+)"/,
		dialect: unix
	}
];

export function supportsLanguage(languageId: string): boolean {
	return RULES.some((rule) => rule.languages.includes(languageId));
}

/** Month and day-of-week names, which cron accepts in place of numbers. */
const NAMES = new Set([
	'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
	'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
]);

// Digits and the punctuation cron builds fields from: steps, ranges `1-5`, lists `1,15`,
// and the Quartz/EventBridge extras `?`, `L`, `15W`, `6#3`. A line comment rather than a
// block one, because the step syntax contains the characters that would close a block.
const NUMERIC_FIELD = /^[\d*/,\-?LW#]+$/i;

function fieldLooksLikeCron(field: string): boolean {
	if (NUMERIC_FIELD.test(field)) return true;
	// Named values still combine with ranges, lists and steps: MON-FRI, JAN,MAR, MON/2.
	const parts = field.toUpperCase().split(/[,\-/]/).filter(Boolean);
	return parts.length > 0 && parts.every((part) => NAMES.has(part) || /^\d+$/.test(part) || part === '*');
}

/**
 * Whether a value that failed to parse was nonetheless an attempt at cron.
 *
 * This exists to separate two failures that deserve very different volumes. `0 3 * * *` in an
 * EventBridge field is a real bug -- six fields were required, five were given, and the
 * deployment is broken -- so it earns an error. `whenever the release manager says so` under a
 * `schedule:` key is not a broken schedule at all; `schedule` is not a reserved word, and the
 * only thing wrong is that this extension's regex went looking there. That earns a warning at
 * most, because the mistake is ours.
 *
 * The test is shape, not validity: the right number of whitespace-separated fields, each built
 * only from things cron fields are built from. Deliberately generous -- when it is unsure it
 * says no, which downgrades to a warning rather than shouting at correct code.
 */
export function looksLikeCron(expression: string): boolean {
	const trimmed = expression.trim();
	// A macro, including a misspelled one: `@daly` is a typo in cron, not prose.
	if (/^@[a-z]+$/i.test(trimmed)) return true;

	const fields = trimmed.split(/\s+/);
	// Five for Unix, six for seconds-first and EventBridge, seven for Quartz with a year.
	if (fields.length < 5 || fields.length > 7) return false;
	return fields.every(fieldLooksLikeCron);
}

/** Every cron expression on one line. A line carries at most one in practice, but not by rule. */
export function hitsOnLine(languageId: string, text: string): Hit[] {
	const found: Hit[] = [];

	for (const rule of RULES) {
		if (!rule.languages.includes(languageId)) continue;
		const match = rule.pattern.exec(text);
		const raw = match?.groups?.['expr'];
		if (!match || raw === undefined) continue;

		const dialect = rule.dialect(raw);
		if (!dialect) continue;

		const rawStart = text.indexOf(raw, match.index);
		const unwrapped = rule.unwrap?.(raw);
		const inner = unwrapped ? unwrapped.text : raw;
		if (!inner.trim()) continue;

		// Trimming shifts the start, so the underline sits on the expression rather than on
		// whitespace an author happened to leave inside the quotes.
		const lead = inner.length - inner.trimStart().length;
		const expression = inner.trim();
		found.push({
			expression,
			dialect,
			start: rawStart + (unwrapped ? unwrapped.offset : 0) + lead,
			length: expression.length
		});
	}
	return found;
}

/**
 * The dialect to complete in at a cursor, which cannot reuse the rules above: completion runs
 * while the value is still empty or half-typed, and those patterns all require a value to match.
 * So this matches only the key and the opening quote, on the text to the left of the cursor.
 */
const COMPLETION_PREFIXES: readonly {
	languages: readonly string[];
	pattern: RegExp;
	dialect: Dialect;
}[] = [
	{
		languages: ['yaml', 'github-actions-workflow'],
		pattern: /(?:^|\s|-)\s*(?:cron|schedule)\s*:\s*["']?(?<typed>[^"']*)$/,
		dialect: 'unix'
	},
	{ languages: ['java', 'kotlin'], pattern: /\bcron\s*=\s*"(?<typed>[^"]*)$/, dialect: 'seconds' },
	{
		languages: ['terraform', 'tf', 'hcl'],
		pattern: /\bschedule_expression\s*=\s*"(?:cron\()?(?<typed>[^"()]*)$/,
		dialect: 'eventbridge'
	},
	{
		languages: ['terraform', 'tf', 'hcl'],
		pattern: /\brecurrence\s*=\s*"(?<typed>[^"]*)$/,
		dialect: 'unix'
	}
];

export interface CompletionHit {
	readonly dialect: Dialect;
	/** What the user has typed of the expression so far, which becomes the replaced range. */
	readonly typed: string;
}

/** `before` is the line text to the left of the cursor. */
export function completionHit(languageId: string, before: string): CompletionHit | null {
	for (const entry of COMPLETION_PREFIXES) {
		if (!entry.languages.includes(languageId)) continue;
		const typed = entry.pattern.exec(before)?.groups?.['typed'];
		if (typed === undefined) continue;
		return { dialect: entry.dialect, typed };
	}
	return null;
}
