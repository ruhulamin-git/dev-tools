/**
 * Schedule warnings.
 *
 * These are not syntax errors — every expression that reaches here parses cleanly and would
 * be accepted by cron. They are the schedules that do something other than what the person
 * writing them almost certainly meant. That is the gap this tool fills over a plain
 * validator: syntax checkers say "this is legal", not "this is not what you think".
 */

import { expandField, expandFieldRaw, type CronResult } from './cron';
import { DIALECTS, type Dialect, type FieldName } from './dialects';

export interface ScheduleWarning {
	/** Stable identifier, so a rule can be tested and suppressed by name. */
	id: 'uneven-step' | 'day-or' | 'short-month' | 'on-the-hour';
	title: string;
	detail: string;
}

/**
 * Keyed by field name rather than position: the seconds dialect shifts every field along by
 * one, so an index that means "hour" in Unix means "minute" there.
 */
const FIELD_LABEL: Partial<Record<FieldName, string>> = {
	second: 'second',
	minute: 'minute',
	hour: 'hour',
	dayOfMonth: 'day-of-month',
	month: 'month',
	dayOfWeek: 'day-of-week'
};
/** What one full cycle of each field is, for describing where a step wraps. */
const CYCLE: Partial<Record<FieldName, string>> = {
	second: 'the minute',
	minute: 'the hour',
	hour: 'the day',
	dayOfMonth: 'the month',
	month: 'the year',
	dayOfWeek: 'the week'
};
/** The unit a gap in each field is counted in. */
const UNIT: Partial<Record<FieldName, string>> = {
	second: 'second',
	minute: 'minute',
	hour: 'hour',
	dayOfMonth: 'day',
	month: 'month',
	dayOfWeek: 'day'
};

/** Where a named field sits in this dialect, or -1 when the dialect has no such field. */
function indexOf(dialect: Dialect, name: FieldName): number {
	return DIALECTS[dialect].fields.findIndex((meta) => meta.name === name);
}

const MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_LABEL = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

function plural(count: number, noun: string): string {
	return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function ordinal(day: number): string {
	if (day === 1 || day === 21 || day === 31) return `${day}st`;
	if (day === 2 || day === 22) return `${day}nd`;
	if (day === 3 || day === 23) return `${day}rd`;
	return `${day}th`;
}

function list(items: string[]): string {
	if (items.length <= 1) return items.join('');
	return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * A step that does not divide its field evenly leaves a short gap at the wrap.
 *
 * `*''/7` in the minute field is the classic: :00 :07 … :56, then straight back to :00, so the
 * interval across the hour boundary is 4 minutes, not 7. Only steps are checked — an explicit
 * list like `0,7,14` is uneven by choice, and warning about it would be noise.
 */
function unevenStep(
	expression: string,
	result: CronResult,
	dialect: Dialect
): ScheduleWarning | null {
	for (let index = 0; index < result.fields.length; index++) {
		const name = result.fields[index].name;
		const cycle = CYCLE[name];
		const unit = UNIT[name];
		// The year has no enclosing cycle to wrap around, so a step in it cannot be uneven.
		if (!cycle || !unit) continue;

		const raw = result.fields[index].value;
		if (!raw.includes('/')) continue;

		const expansion = expandFieldRaw(expression, index, dialect);
		if (!expansion || expansion.numbers.length < 2) continue;

		const values = expansion.numbers;
		const step = values[1] - values[0];
		const wrap = values[0] + expansion.span - values[values.length - 1];
		if (wrap === step) continue;

		const preview =
			values.length > 4
				? `${values.slice(0, 3).join(', ')} … ${values[values.length - 1]}`
				: values.join(', ');

		return {
			id: 'uneven-step',
			title: `The step in ${FIELD_LABEL[name]} does not divide ${cycle} evenly`,
			detail:
				`${raw} matches ${preview}. After ${values[values.length - 1]} it restarts at ` +
				`${values[0]}, so the gap across ${cycle} is ${plural(wrap, unit)}, not ${step}.`
		};
	}
	return null;
}

/** Both day fields restricted means OR, which is the single most misread rule in cron. */
function dayOr(expression: string, dialect: Dialect): ScheduleWarning | null {
	const domIndex = indexOf(dialect, 'dayOfMonth');
	const dowIndex = indexOf(dialect, 'dayOfWeek');

	const dayOfMonth = expandFieldRaw(expression, domIndex, dialect);
	const dayOfWeek = expandFieldRaw(expression, dowIndex, dialect);
	if (!dayOfMonth || !dayOfWeek || dayOfMonth.all || dayOfWeek.all) return null;

	const days = expandField(expression, domIndex, dialect)?.labels ?? [];
	const weekdays = expandField(expression, dowIndex, dialect)?.labels ?? [];

	return {
		id: 'day-or',
		title: 'Day of month and day of week are both restricted',
		detail:
			`Cron ORs these two fields rather than ANDing them, so the job runs whenever ` +
			`either matches: on ${list(days.map((d) => `day ${d}`))} of the month, and ` +
			`separately on every ${list(weekdays)} — not only when the two coincide.`
	};
}

/** Days 29-31 do not exist in every month, and cron skips the months that lack them. */
function shortMonth(expression: string, dialect: Dialect): ScheduleWarning | null {
	const dayOfMonth = expandFieldRaw(expression, indexOf(dialect, 'dayOfMonth'), dialect);
	const month = expandFieldRaw(expression, indexOf(dialect, 'month'), dialect);
	if (!dayOfMonth || !month) return null;

	// `*` covers the 1st, so it never misses a month, and `L` resolves per month by
	// definition. Neither is a schedule pinned to a day that might not exist.
	if (dayOfMonth.all || dayOfMonth.numbers.length === 0) return null;

	// A month is only skipped when *none* of the chosen days exist in it. `15,31` still runs
	// in February on the 15th, so it is not skipped and there is nothing to warn about.
	const missing = month.numbers.filter(
		(m) => !dayOfMonth.numbers.some((day) => day <= MONTH_LENGTH[m - 1])
	);
	if (missing.length === 0) return null;

	const day = Math.min(...dayOfMonth.numbers);

	// February does have a 29th, just not three years in four.
	if (day === 29 && missing.length === 1 && missing[0] === 2) {
		return {
			id: 'short-month',
			title: 'February only has a 29th in leap years',
			detail:
				'This schedule runs in February once every four years. Every other year it is ' +
				'skipped silently — there is no error and no substitute date.'
		};
	}

	const names = missing.map((m) => MONTH_LABEL[m - 1]);
	return {
		id: 'short-month',
		title: `Day ${day} does not exist in every month this runs`,
		detail:
			`${list(names)} ${missing.length === 1 ? 'has' : 'have'} no ${ordinal(day)}, so the ` +
			`job is skipped ${missing.length === 1 ? 'that month' : 'in those months'} with no ` +
			`error. For month-end work, schedule the 1st and subtract a day in your code.`
	};
}

/** Everything scheduled on minute 0 of every hour lands in the same busy minute. */
function onTheHour(
	expression: string,
	result: CronResult,
	dialect: Dialect
): ScheduleWarning | null {
	const hour = expandFieldRaw(expression, indexOf(dialect, 'hour'), dialect);
	if (!hour?.all) return null;

	const minute = result.fields[indexOf(dialect, 'minute')];
	if (minute?.value !== '0') return null;

	// A seconds dialect firing at second 0 of minute 0 is the same herd; anything else in the
	// seconds field means the job is already offset, so there is nothing to say.
	const secondIndex = indexOf(dialect, 'second');
	if (secondIndex !== -1 && result.fields[secondIndex].value !== '0') return null;

	return {
		id: 'on-the-hour',
		title: 'Firing exactly on the hour',
		detail:
			'Minute 0 is the busiest minute on most machines, because it is where everyone ' +
			'puts their hourly jobs. Offsetting to an arbitrary minute spreads the load and ' +
			'makes a slow run less likely to collide with the next one.'
	};
}

/**
 * Every warning that applies to an expression, most-specific first.
 *
 * Returns nothing for an expression that does not parse — a broken expression already has an
 * error message, and piling advisories on top of it would bury the actual problem.
 */
export function lintSchedule(
	expression: string,
	result: CronResult,
	dialect: Dialect = 'unix'
): ScheduleWarning[] {
	if (!result.valid) return [];

	return [
		unevenStep(expression, result, dialect),
		dayOr(expression, dialect),
		shortMonth(expression, dialect),
		onTheHour(expression, result, dialect)
	].filter((warning): warning is ScheduleWarning => warning !== null);
}
