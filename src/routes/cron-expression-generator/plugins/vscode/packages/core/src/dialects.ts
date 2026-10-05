/**
 * Cron dialects.
 *
 * "6-field cron" is not one thing. Two systems can accept the same six fields and schedule
 * completely different times, because one reads a leading seconds field and the other reads
 * a trailing year. `0 18 ? * MON-FRI *` is 6pm on weekdays to AWS EventBridge, and "18 past
 * every hour" to anything expecting seconds first.
 *
 * So the dialect is asked for rather than guessed, and each one carries its own field list,
 * legend and day-of-week numbering.
 */

export type Dialect = 'unix' | 'seconds' | 'eventbridge';

export type FieldName =
	| 'second'
	| 'minute'
	| 'hour'
	| 'dayOfMonth'
	| 'month'
	| 'dayOfWeek'
	| 'year';

export interface SyntaxRow {
	/** The character or value form, e.g. an asterisk, a slash, `SUN-SAT`. */
	token: string;
	meaning: string;
}

export interface FieldMeta {
	name: FieldName;
	/** Human label shown under the field. */
	label: string;
	/** Allowed values, shown in the field hint. */
	range: string;
	/** What this field accepts beyond the operators every field shares. */
	extras: SyntaxRow[];
}

export interface DialectSpec {
	id: Dialect;
	label: string;
	/** Where you would meet this dialect, shown beside the selector. */
	note: string;
	/** Loaded when the current expression has the wrong number of fields for this dialect. */
	sample: string;
	fields: FieldMeta[];
	/**
	 * False when the dialect numbers day-of-week from 1 = Sunday rather than 0 = Sunday.
	 * Feeds cronstrue directly, and drives the shift applied before cron-parser sees it.
	 */
	dayOfWeekStartIndexZero: boolean;
	/** Whether the `@daily` shorthands are accepted. */
	macros: boolean;
}

/** The operators every field in every dialect accepts. */
export const COMMON_SYNTAX: SyntaxRow[] = [
	{ token: '*', meaning: 'any value' },
	{ token: ',', meaning: 'value list separator' },
	{ token: '-', meaning: 'range of values' },
	{ token: '/', meaning: 'step values' }
];

const MINUTE: FieldMeta = { name: 'minute', label: 'Minute', range: '0-59', extras: [] };
const HOUR: FieldMeta = { name: 'hour', label: 'Hour', range: '0-23', extras: [] };
const DAY_OF_MONTH: FieldMeta = {
	name: 'dayOfMonth',
	label: 'Day of month',
	range: '1-31',
	extras: []
};
const MONTH: FieldMeta = {
	name: 'month',
	label: 'Month',
	range: '1-12 or JAN-DEC',
	extras: [{ token: 'JAN-DEC', meaning: 'alternative single values' }]
};
const DAY_OF_WEEK_UNIX: FieldMeta = {
	name: 'dayOfWeek',
	label: 'Day of week',
	range: '0-6 or SUN-SAT',
	extras: [
		{ token: 'SUN-SAT', meaning: 'alternative single values' },
		{ token: '7', meaning: 'sunday (non-standard)' }
	]
};

export const DIALECTS: Record<Dialect, DialectSpec> = {
	unix: {
		id: 'unix',
		label: 'Unix — 5 fields',
		note: 'crontab, Kubernetes CronJob, GitHub Actions',
		sample: '*/15 9-17 * * 1-5',
		dayOfWeekStartIndexZero: true,
		macros: true,
		fields: [MINUTE, HOUR, DAY_OF_MONTH, MONTH, DAY_OF_WEEK_UNIX]
	},

	seconds: {
		id: 'seconds',
		label: 'Seconds — 6 fields',
		note: 'Spring @Scheduled, node-cron, Quartz',
		sample: '*/30 * * * * *',
		// Spring and node-cron keep Unix weekday numbering; only the seconds field is new.
		dayOfWeekStartIndexZero: true,
		macros: false,
		fields: [
			{ name: 'second', label: 'Second', range: '0-59', extras: [] },
			MINUTE,
			HOUR,
			DAY_OF_MONTH,
			MONTH,
			DAY_OF_WEEK_UNIX
		]
	},

	eventbridge: {
		id: 'eventbridge',
		label: 'AWS EventBridge — 6 fields',
		note: 'EventBridge rules — trailing year, no seconds',
		sample: '0 18 ? * MON-FRI *',
		// EventBridge numbers day-of-week 1-7 with 1 = Sunday, unlike Unix.
		dayOfWeekStartIndexZero: false,
		macros: false,
		fields: [
			MINUTE,
			HOUR,
			{
				name: 'dayOfMonth',
				label: 'Day of month',
				range: '1-31',
				extras: [
					{ token: '?', meaning: 'no specific value' },
					{ token: 'L', meaning: 'last day of the month' },
					{ token: 'W', meaning: 'nearest weekday' }
				]
			},
			MONTH,
			{
				name: 'dayOfWeek',
				label: 'Day of week',
				range: '1-7 or SUN-SAT',
				extras: [
					{ token: 'SUN-SAT', meaning: 'alternative single values' },
					{ token: '1', meaning: 'sunday — not Monday' },
					{ token: '?', meaning: 'no specific value' },
					{ token: '#', meaning: 'nth weekday of the month' }
				]
			},
			{ name: 'year', label: 'Year', range: '1970-2199', extras: [] }
		]
	}
};

export const DIALECT_ORDER: Dialect[] = ['unix', 'seconds', 'eventbridge'];

/**
 * Shift a day-of-week field from 1 = Sunday to 0 = Sunday.
 *
 * Only value positions move. A step interval and an nth-weekday occurrence count are counts
 * rather than weekdays, so shifting them would change the schedule.
 */
export function shiftDayOfWeek(field: string): string {
	const shiftValue = (text: string): string =>
		/^\d+$/.test(text) ? String(Math.max(0, Number(text) - 1)) : text;

	return field
		.split(',')
		.map((part) => {
			// `2#1` — shift the weekday, leave the occurrence count alone.
			const [beforeHash, ...afterHash] = part.split('#');
			// `1-5/2` — shift the range ends, leave the step alone.
			const [beforeSlash, ...afterSlash] = beforeHash.split('/');
			const shifted = beforeSlash.split('-').map(shiftValue).join('-');

			return [[shifted, ...afterSlash].join('/'), ...afterHash].join('#');
		})
		.join(',');
}

/**
 * Expand a plain numeric field into the values it matches, or null when it matches anything.
 * Used for the EventBridge year, which no cron library here will evaluate for us.
 */
export function expandYears(field: string): number[] | null {
	const text = field.trim();
	if (text === '' || text === '*' || text === '?') return null;

	const years = new Set<number>();
	for (const part of text.split(',')) {
		const [range, stepText] = part.split('/');
		const step = stepText ? Number(stepText) : 1;
		if (!Number.isInteger(step) || step < 1) return null;

		const [startText, endText] = range.split('-');
		const wildcard = startText === '*';
		const start = wildcard ? 1970 : Number(startText);
		const end = endText === undefined ? (wildcard ? 2199 : start) : Number(endText);
		if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return null;

		for (let year = start; year <= end; year += step) years.add(year);
	}

	return years.size > 0 ? [...years].sort((a, b) => a - b) : null;
}

export interface Translation {
	/** An expression cron-parser reads with the meaning the dialect intended. */
	expression: string;
	/** Years the schedule is confined to, or null when it is not confined. */
	years: number[] | null;
}

/**
 * Rewrite an expression into the form cron-parser evaluates correctly.
 *
 * Unix and seconds forms pass straight through — cron-parser reads both natively. EventBridge
 * does not: its trailing year is not a field cron-parser knows, `?` means "unset", and its
 * weekday numbering is off by one. Handing it over untranslated is the whole reason this
 * exists, because cron-parser would quietly read the leading minute as seconds and produce a
 * schedule an hour's worth of runs wrong.
 */
export function translate(fields: string[], dialect: Dialect): Translation {
	if (dialect !== 'eventbridge') return { expression: fields.join(' '), years: null };

	const [minute, hour, dayOfMonth, month, dayOfWeek, year] = fields;
	const unset = (field: string) => (field === '?' ? '*' : field);
	const weekday = unset(dayOfWeek ?? '*');

	return {
		expression: [
			minute,
			hour,
			unset(dayOfMonth ?? '*'),
			month,
			weekday === '*' ? '*' : shiftDayOfWeek(weekday)
		].join(' '),
		years: expandYears(year ?? '*')
	};
}
