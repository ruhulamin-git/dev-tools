/**
 * Curated example expressions, one set per dialect.
 *
 * Ordered roughly from simplest to most involved — the "Random example" button cycles through
 * them, so each step should teach one new piece of syntax. They are per-dialect because a
 * Unix expression is not valid EventBridge and vice versa; offering the wrong set would hand
 * people expressions their scheduler rejects.
 *
 * Every entry here is asserted valid in `examples.test.ts`, against its own dialect.
 */

import type { Dialect } from './dialects';

export interface CronExample {
	expression: string;
	label: string;
}

const UNIX: CronExample[] = [
	{ expression: '* * * * *', label: 'Every minute' },
	{ expression: '*/5 * * * *', label: 'Every 5 minutes — the step operator' },
	{ expression: '0 * * * *', label: 'Every hour, on the hour' },
	{ expression: '0 0 * * *', label: 'Every day at midnight' },
	{ expression: '30 6 * * 1-5', label: 'Weekday mornings — a day-of-week range' },
	{ expression: '*/15 9-17 * * 1-5', label: 'Every 15 minutes during office hours' },
	{ expression: '0 0 1 * *', label: 'First day of every month' },
	{ expression: '0 3 * * 0', label: 'Weekly maintenance window, Sunday at 03:00' },
	{ expression: '15 2,14 * * *', label: 'Twice a day — a value list' },
	{ expression: '0 0 1 1 *', label: 'Once a year, on New Year’s Day' },
	{ expression: '5 4 4 9 6', label: 'Day-of-month OR day-of-week, not AND' },
	{ expression: '@daily', label: 'Shorthand for 0 0 * * *' }
];

const SECONDS: CronExample[] = [
	{ expression: '* * * * * *', label: 'Every second' },
	{ expression: '*/30 * * * * *', label: 'Every 30 seconds — the seconds field' },
	{ expression: '0 * * * * *', label: 'Every minute, on the second' },
	{ expression: '0 */5 * * * *', label: 'Every 5 minutes' },
	{ expression: '0 0 * * * *', label: 'Every hour, on the hour' },
	{ expression: '0 30 6 * * *', label: 'Every day at 06:30' },
	{ expression: '*/10 * 9-17 * * 1-5', label: 'Every 10 seconds during office hours' },
	{ expression: '0 0 12 * * 1-5', label: 'Weekdays at noon' },
	{ expression: '0 15,45 * * * *', label: 'Twice an hour — a value list' },
	{ expression: '0 0 3 * * 0', label: 'Weekly maintenance, Sunday at 03:00' },
	{ expression: '0 0 0 1 * *', label: 'First day of every month' }
];

const EVENTBRIDGE: CronExample[] = [
	{ expression: '* * * * ? *', label: 'Every minute — ? leaves the other day field unset' },
	{ expression: '*/5 * * * ? *', label: 'Every 5 minutes' },
	{ expression: '0 * * * ? *', label: 'Every hour, on the hour' },
	{ expression: '0 0 * * ? *', label: 'Every day at midnight' },
	{ expression: '0 18 ? * MON-FRI *', label: 'Weekdays at 18:00' },
	{ expression: '0 0 ? * 1 *', label: 'Sundays — 1 is Sunday here, not Monday' },
	{ expression: '0 8 1 * ? *', label: 'First day of every month at 08:00' },
	{ expression: '0 12 L * ? *', label: 'Last day of the month — the L marker' },
	{ expression: '0 12 ? * 2#1 *', label: 'First Monday of the month — the # marker' },
	{ expression: '0 0 1 1 ? 2027', label: 'New Year’s Day 2027 — the year field' }
];

const BY_DIALECT: Record<Dialect, CronExample[]> = {
	unix: UNIX,
	seconds: SECONDS,
	eventbridge: EVENTBRIDGE
};

/** The example set for a dialect. */
export function examplesFor(dialect: Dialect): CronExample[] {
	return BY_DIALECT[dialect];
}

/** Next example after `current`, wrapping around. Starts at the top when unmatched. */
export function nextExample(current: string, dialect: Dialect = 'unix'): CronExample {
	const list = BY_DIALECT[dialect];
	const index = list.findIndex((example) => example.expression === current.trim());
	return list[(index + 1) % list.length];
}
