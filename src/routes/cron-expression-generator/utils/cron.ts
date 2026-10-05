/**
 * Cron parsing utilities.
 *
 * Pure and DOM-free so it unit-tests under jsdom and survives the prerender pass.
 *
 * Every entry point takes a dialect, defaulting to 5-field Unix. The dialect decides how many
 * fields there are, what they mean, and how day-of-week is numbered — see `dialects.ts` for
 * why guessing that from the field count is not safe.
 */

import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
import {
	COMMON_SYNTAX,
	DIALECTS,
	expandYears,
	translate,
	type Dialect,
	type FieldName,
	type SyntaxRow
} from './dialects';

// Re-exported so components have one module to import from, rather than having to know
// which half of the pair each name lives in.
export type { Dialect, FieldName, SyntaxRow } from './dialects';
export { DIALECTS, DIALECT_ORDER } from './dialects';

export interface FieldInfo {
	name: FieldName;
	/** Human label shown under the field. */
	label: string;
	/** Allowed values, shown in the field hint. */
	range: string;
	/** The raw text the user typed for this field, or '' when not yet typed. */
	value: string;
}

export interface CronResult {
	valid: boolean;
	/** Human-readable description, present when valid. */
	description?: string;
	/** One entry per field in the dialect, always present so the breakdown can render. */
	fields: FieldInfo[];
	/** The expression a macro expanded to, when the input was a macro. */
	expandedFrom?: string;
	/** Present when invalid. Written for a human, not a stack trace. */
	error?: string;
}

/**
 * Non-standard shorthands supported by most cron implementations.
 * `@reboot` is deliberately absent — it has no schedule to describe.
 */
const MACROS: Record<string, string> = {
	'@yearly': '0 0 1 1 *',
	'@annually': '0 0 1 1 *',
	'@monthly': '0 0 1 * *',
	'@weekly': '0 0 * * 0',
	'@daily': '0 0 * * *',
	'@midnight': '0 0 * * *',
	'@hourly': '0 * * * *'
};

const MONTH_NAMES = [
	'JAN',
	'FEB',
	'MAR',
	'APR',
	'MAY',
	'JUN',
	'JUL',
	'AUG',
	'SEP',
	'OCT',
	'NOV',
	'DEC'
];
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Split on any run of whitespace, ignoring leading and trailing space. */
function splitFields(expression: string): string[] {
	const trimmed = expression.trim();
	return trimmed === '' ? [] : trimmed.split(/\s+/);
}

/** Macros are a Unix convention; the 6-field dialects do not accept them. */
function macroFor(expression: string, dialect: Dialect): string | undefined {
	if (!DIALECTS[dialect].macros) return undefined;
	return MACROS[expression.trim().toLowerCase()];
}

/** Pad or truncate to the dialect's field count so the breakdown always has something. */
function toFieldInfo(parts: string[], dialect: Dialect): FieldInfo[] {
	return DIALECTS[dialect].fields.map((meta, index) => ({
		name: meta.name,
		label: meta.label,
		range: meta.range,
		value: parts[index] ?? ''
	}));
}

/**
 * Turn a library error into something a human can act on.
 *
 * cronstrue's own messages are already readable ("minutes part must be >= 0 and <= 59")
 * and pass through unchanged. The rewrites below cover the cases cronstrue accepts and
 * only cron-parser rejects, where the raw wording says nothing useful.
 */
function humanizeError(message: string): string {
	const clean = message.replace(/^Error:\s*/, '');

	// Fires for dates that can never occur, e.g. `0 0 31 2 *` — February has no 31st.
	if (/Invalid explicit day of month/i.test(clean)) {
		return 'That day never occurs in the month you picked, so this schedule would never run.';
	}

	// e.g. `0 0 * * 5-1`
	const backwards = clean.match(/Invalid range: (\S+?),/);
	if (backwards) {
		return `The range ${backwards[1]} runs backwards. Ranges go from the lower value to the higher one.`;
	}

	// e.g. `*/0 * * * *`
	if (/cannot repeat at every 0/i.test(clean)) {
		return 'A step of 0 is not a repeat interval. Use */1 or higher.';
	}

	if (/Invalid characters/i.test(clean)) {
		return 'That expression contains characters cron does not understand.';
	}

	return clean;
}

/**
 * Reject names that belong to a different field.
 *
 * Needed because the two libraries do not always read the same expression the same way.
 * `0 18 ? * MON-FRI *` is an EventBridge schedule; hand it to the seconds dialect and
 * cronstrue recognises the EventBridge shape while cron-parser reads the leading field as
 * seconds — producing a description of 6pm above run times of 18 minutes past every hour.
 * Both libraries "succeed", so agreement has to be checked rather than assumed, and the
 * cheapest sound check is that every name lands in a field that accepts names.
 */
function nameError(parts: string[], dialect: Dialect): string | null {
	const fields = DIALECTS[dialect].fields;

	for (let index = 0; index < fields.length; index++) {
		const meta = fields[index];
		const names = parts[index]?.match(/[A-Za-z]+/g) ?? [];

		for (const name of names) {
			const upper = name.toUpperCase();
			// `L` and `W` are position markers rather than names, where the field allows them.
			if (meta.extras.some((row) => row.token === upper)) continue;

			const allowed =
				meta.name === 'month' ? MONTH_NAMES : meta.name === 'dayOfWeek' ? DAY_NAMES : [];
			if (allowed.includes(upper)) continue;

			// Naming where the value *does* belong is more use than saying where it does not.
			const belongs = DAY_NAMES.includes(upper)
				? 'a day name — it belongs in the day-of-week field'
				: MONTH_NAMES.includes(upper)
					? 'a month name — it belongs in the month field'
					: 'not a value cron understands';

			return `The ${meta.label.toLowerCase()} field does not accept "${name}". That is ${belongs}.`;
		}
	}
	return null;
}

/** A field count that belongs to a different dialect is a nudge, not just a miscount. */
function wrongCountHint(count: number, dialect: Dialect): string {
	const others = (Object.keys(DIALECTS) as Dialect[]).filter(
		(id) => id !== dialect && DIALECTS[id].fields.length === count
	);
	if (others.length === 0) return '';

	const names = others.map((id) => DIALECTS[id].label.split(' — ')[0]);
	return ` ${count} fields is the shape of ${names.join(' or ')} — switch dialect above if that is what you meant.`;
}

/**
 * Validate an expression and describe it in English.
 *
 * Returns a result rather than throwing — the UI re-parses on every keystroke,
 * and most keystrokes land on a half-typed, invalid expression.
 */
export function parseCron(expression: string, dialect: Dialect = 'unix'): CronResult {
	const spec = DIALECTS[dialect];
	const fieldCount = spec.fields.length;

	const raw = expression.trim();
	const macro = macroFor(raw, dialect);
	const effective = macro ?? raw;
	const parts = splitFields(effective);
	const fields = toFieldInfo(parts, dialect);

	if (raw === '') {
		return { valid: false, fields, error: 'Enter a cron expression to see what it means.' };
	}

	if (raw.toLowerCase() === '@reboot') {
		return {
			valid: false,
			fields,
			error: '@reboot runs once at startup, so it has no schedule to preview.'
		};
	}

	if (raw.startsWith('@')) {
		if (!spec.macros) {
			return {
				valid: false,
				fields,
				error: `${spec.label.split(' — ')[0]} does not accept @ shorthands. Switch to Unix, or write the schedule out in full.`
			};
		}
		if (!macro) {
			return {
				valid: false,
				fields,
				error: `Unknown shorthand "${raw}". Try @hourly, @daily, @weekly, @monthly, or @yearly.`
			};
		}
	}

	if (parts.length !== fieldCount) {
		const noun = parts.length === 1 ? 'field' : 'fields';
		return {
			valid: false,
			fields,
			error:
				`${spec.label.split(' — ')[0]} needs ${fieldCount} fields, but this has ` +
				`${parts.length} ${noun}.${wrongCountHint(parts.length, dialect)}`
		};
	}

	const named = nameError(parts, dialect);
	if (named) return { valid: false, fields, error: named };

	let description: string;
	try {
		description = cronstrue.toString(effective, {
			throwExceptionOnParseError: true,
			use24HourTimeFormat: false,
			verbose: false,
			dayOfWeekStartIndexZero: spec.dayOfWeekStartIndexZero
		});
	} catch (error) {
		return { valid: false, fields, error: humanizeError(String(error)) };
	}

	// cronstrue is lenient about some ranges cron-parser rejects, so both have to agree
	// before the expression is called valid — and cron-parser only sees the translated form,
	// or it would read an EventBridge minute as seconds.
	try {
		CronExpressionParser.parse(translate(parts, dialect).expression);
	} catch (error) {
		return { valid: false, fields, error: humanizeError(String(error)) };
	}

	return {
		valid: true,
		description,
		fields,
		expandedFrom: macro ? raw : undefined
	};
}

/** Guard on a year-filtered scan so an unreachable year cannot spin. */
const MAX_SCAN = 10_000;

/**
 * The next `count` run times for a valid expression.
 *
 * `from` is required by callers in the browser so that build-time dates never leak
 * into the prerendered HTML — see the route's NextRuns component.
 *
 * `tz` is the timezone the *schedule* is interpreted in. Left undefined, cron fields
 * resolve against the visitor's local zone, which is what a browser-side tool wants:
 * `0 3 * * *` should mean 3am where the reader is. Tests pass 'UTC' to pin it.
 */
export function getNextRuns(
	expression: string,
	from: Date,
	count = 5,
	tz?: string,
	dialect: Dialect = 'unix'
): Date[] {
	const raw = expression.trim();
	const effective = macroFor(raw, dialect) ?? raw;
	const { expression: translated, years } = translate(splitFields(effective), dialect);

	try {
		const interval = CronExpressionParser.parse(translated, { currentDate: from, tz });
		if (!years) return interval.take(count).map((date) => date.toDate());

		// A year field can rule out long stretches of the calendar, so walk forward with a
		// hard cap and stop as soon as the last allowed year is behind us.
		const lastYear = years[years.length - 1];
		const runs: Date[] = [];
		for (let scanned = 0; scanned < MAX_SCAN && runs.length < count; scanned++) {
			const next = interval.next();
			const year = next.getFullYear();
			if (year > lastYear) break;
			if (years.includes(year)) runs.push(next.toDate());
		}
		return runs;
	} catch {
		return [];
	}
}

/**
 * Everything the given field accepts, for the legend shown when a field is selected.
 * Static per field — it describes the syntax, not whatever happens to be typed.
 */
export function fieldSyntax(index: number, dialect: Dialect = 'unix'): SyntaxRow[] {
	const meta = DIALECTS[dialect].fields[index];
	if (!meta) return [];

	// `1-12 or JAN-DEC` reads as two rows in a legend, and the names row is already an extra.
	const allowed = meta.range.split(' or ')[0];
	return [...COMMON_SYNTAX, { token: allowed, meaning: 'allowed values' }, ...meta.extras];
}

export interface FieldValues {
	/** One label per matching value — names for month and day of week, numbers elsewhere. */
	labels: string[];
	/** True when the field matches every value it possibly could. */
	all: boolean;
}

export interface FieldExpansion {
	/** The matching numbers, de-duplicated and sorted. */
	numbers: number[];
	/** Non-numeric values the parser kept, such as `L` for the last day of the month. */
	literals: string[];
	/** Lowest and highest the field can go, and how many values that spans. */
	min: number;
	max: number;
	span: number;
	/** True when the field matches every value it possibly could. */
	all: boolean;
}

/** The year field is ours to expand — no cron library here models it. */
function expandYearField(parts: string[], dialect: Dialect): FieldExpansion | null {
	const index = DIALECTS[dialect].fields.findIndex((meta) => meta.name === 'year');
	const years = expandYears(parts[index] ?? '*');
	const min = 1970;
	const max = 2199;
	const span = max - min + 1;

	return {
		numbers: years ?? [],
		literals: [],
		min,
		max,
		span,
		all: years === null
	};
}

/**
 * The raw expansion of a field, for callers that need to reason over the numbers rather than
 * display them — the schedule linter, mainly.
 */
export function expandFieldRaw(
	expression: string,
	index: number,
	dialect: Dialect = 'unix'
): FieldExpansion | null {
	const meta = DIALECTS[dialect].fields[index];
	if (!meta) return null;

	const raw = expression.trim();
	const effective = macroFor(raw, dialect) ?? raw;
	const parts = splitFields(effective);

	if (meta.name === 'year') return expandYearField(parts, dialect);

	let values: (number | string)[];
	let min: number;
	let max: number;
	try {
		const parsed = CronExpressionParser.parse(translate(parts, dialect).expression);
		const field = parsed.fields[meta.name as Exclude<FieldName, 'year'>];
		values = [...field.values];
		min = field.min;
		max = field.max;
	} catch {
		return null;
	}

	// The day-of-month field can hold the literal `L` (last day of the month) alongside its
	// numbers, so the two are kept apart rather than forced through the number path.
	const rawNumbers = values.filter((value): value is number => typeof value === 'number');
	const literals = values.filter((value): value is string => typeof value === 'string');

	// 0 and 7 both mean Sunday, so `*` arrives as 0-7 and `0,7` as a duplicate pair.
	const isDayOfWeek = meta.name === 'dayOfWeek';
	const numbers = [...new Set(rawNumbers.map((value) => (isDayOfWeek ? value % 7 : value)))].sort(
		(a, b) => a - b
	);

	const span = isDayOfWeek ? DAY_NAMES.length : max - min + 1;

	return {
		numbers,
		literals,
		min,
		// Day of week reports max 7, but 7 is a second spelling of 0 rather than an eighth day.
		max: isDayOfWeek ? DAY_NAMES.length - 1 : max,
		span,
		// A field carrying a literal is never "everything", however many numbers came with it.
		all: literals.length === 0 && numbers.length === span
	};
}

export function expandField(
	expression: string,
	index: number,
	dialect: Dialect = 'unix'
): FieldValues | null {
	const expansion = expandFieldRaw(expression, index, dialect);
	if (!expansion) return null;

	const name = DIALECTS[dialect].fields[index].name;
	const labels = expansion.numbers.map((value) => {
		if (name === 'month') return MONTH_NAMES[value - 1];
		// Weekdays are always shown by name: the numbering differs between dialects, the
		// names do not, so a name can never be read as the wrong day.
		if (name === 'dayOfWeek') return DAY_NAMES[value];
		return String(value);
	});

	return { labels: [...labels, ...expansion.literals], all: expansion.all };
}

/**
 * The character range `[start, end)` a field occupies in the raw expression, for selecting
 * that field's text in the input.
 *
 * Returns null when the field is not there to select: an index outside the dialect's fields,
 * an expression too short to have one, or a macro — a macro's breakdown shows its *expansion*,
 * and those values appear nowhere in the text the visitor typed.
 */
export function fieldRangeAt(
	expression: string,
	index: number,
	dialect: Dialect = 'unix'
): [number, number] | null {
	if (index < 0 || index >= DIALECTS[dialect].fields.length) return null;
	if (expression.trim().startsWith('@')) return null;

	const word = /\S+/g;
	let match: RegExpExecArray | null;
	let position = 0;

	while ((match = word.exec(expression)) !== null) {
		if (position === index) return [match.index, match.index + match[0].length];
		position++;
	}
	return null;
}

/**
 * Which field index the cursor sits in, for the highlight-as-you-type breakdown.
 * Returns -1 when the caret is past the last field or the expression is a macro.
 */
export function fieldIndexAtCursor(
	expression: string,
	cursor: number,
	dialect: Dialect = 'unix'
): number {
	if (expression.trim().startsWith('@')) return -1;

	const upToCursor = expression.slice(0, cursor);
	// A trailing space means the caret has moved on to the next field.
	const parts = upToCursor.split(/\s+/);
	const leading = /^\s/.test(upToCursor) ? 1 : 0;
	const index = parts.length - 1 - leading;

	return index >= 0 && index < DIALECTS[dialect].fields.length ? index : -1;
}
