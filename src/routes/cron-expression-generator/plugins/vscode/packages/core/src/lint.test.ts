import { describe, expect, it } from 'vitest';
import { parseCron } from './cron';
import type { Dialect } from './dialects';
import { lintSchedule, type ScheduleWarning } from './lint';

function lint(expression: string, dialect: Dialect = 'unix'): ScheduleWarning[] {
	return lintSchedule(expression, parseCron(expression, dialect), dialect);
}

function ids(expression: string, dialect: Dialect = 'unix'): string[] {
	return lint(expression, dialect).map((warning) => warning.id);
}

describe('lintSchedule', () => {
	it('says nothing about a schedule with nothing wrong with it', () => {
		expect(lint('*/15 9-17 * * 1-5')).toEqual([]);
		expect(lint('0 3 * * *')).toEqual([]);
		expect(lint('30 6 * * 1-5')).toEqual([]);
	});

	it('stays quiet while the expression is invalid', () => {
		// A broken expression already has an error; advisories on top would bury it.
		expect(lint('0 0 31 2 *')).toEqual([]);
		expect(lint('nonsense')).toEqual([]);
		expect(lint('')).toEqual([]);
	});
});

describe('uneven step', () => {
	it('flags a minute step that does not divide the hour', () => {
		const [warning] = lint('*/7 * * * *');
		expect(warning.id).toBe('uneven-step');
		// 0, 7 ... 56, then 0 again: four minutes across the boundary, not seven.
		expect(warning.detail).toContain('4 minutes');
		expect(warning.detail).toContain('not 7');
	});

	it('flags an hour step that does not divide the day', () => {
		// 0, 5, 10, 15, 20 then 0 - a four-hour gap overnight.
		const [warning] = lint('0 */5 * * *');
		expect(warning.id).toBe('uneven-step');
		expect(warning.detail).toContain('4 hours');
	});

	it('stays quiet when the step divides evenly', () => {
		expect(ids('*/15 * * * *')).not.toContain('uneven-step');
		expect(ids('*/30 * * * *')).not.toContain('uneven-step');
		expect(ids('0 */6 * * *')).not.toContain('uneven-step');
	});

	it('ignores an explicit list, which is uneven on purpose', () => {
		expect(ids('0,7,14 * * * *')).not.toContain('uneven-step');
	});
});

describe('day-of-month / day-of-week OR', () => {
	it('flags both day fields being restricted', () => {
		const [warning] = lint('0 0 1 * 1');
		expect(warning.id).toBe('day-or');
		expect(warning.detail).toContain('day 1');
		expect(warning.detail).toContain('MON');
	});

	it('stays quiet when only one day field is restricted', () => {
		expect(ids('0 0 1 * *')).not.toContain('day-or');
		expect(ids('0 0 * * 1')).not.toContain('day-or');
	});
});

describe('short months', () => {
	it('flags a 31st, naming the months that lack one', () => {
		const [warning] = lint('0 0 31 * *');
		expect(warning.id).toBe('short-month');
		expect(warning.detail).toContain('February');
		expect(warning.detail).toContain('April');
		expect(warning.detail).toContain('November');
		expect(warning.detail).not.toContain('January');
	});

	it('flags a 30th only for February', () => {
		const warning = lint('0 0 30 * *').find((w) => w.id === 'short-month');
		expect(warning?.detail).toContain('February');
		expect(warning?.detail).not.toContain('April');
	});

	it('treats a 29th as the leap-year case it is', () => {
		const warning = lint('0 0 29 * *').find((w) => w.id === 'short-month');
		expect(warning?.title).toContain('leap year');
	});

	it('stays quiet when every selected month has that day', () => {
		expect(ids('0 0 31 1,3,5 *')).not.toContain('short-month');
		expect(ids('0 0 29 1 *')).not.toContain('short-month');
	});

	it('stays quiet when another day in the list still lands in the short month', () => {
		// `15,31` runs in February on the 15th, so February is not skipped.
		expect(ids('0 0 15,31 * *')).not.toContain('short-month');
	});

	it('stays quiet for a wildcard day, which always includes the 1st', () => {
		expect(ids('0 0 * * *')).not.toContain('short-month');
		expect(ids('*/15 9-17 * * 1-5')).not.toContain('short-month');
	});

	it('stays quiet for L, which resolves per month by definition', () => {
		expect(ids('0 0 L * *')).not.toContain('short-month');
	});
});

describe('on the hour', () => {
	it('flags minute 0 of every hour', () => {
		expect(ids('0 * * * *')).toContain('on-the-hour');
	});

	it('leaves ordinary daily schedules alone', () => {
		expect(ids('0 3 * * *')).not.toContain('on-the-hour');
		expect(ids('0 0 * * *')).not.toContain('on-the-hour');
	});
});

describe('across dialects', () => {
	it('reads the right fields in the seconds dialect, where every field shifts along one', () => {
		// `*/7` is in the *seconds* field here, not the minute field.
		const [warning] = lint('*/7 * * * * *', 'seconds');
		expect(warning.id).toBe('uneven-step');
		expect(warning.title).toContain('second');
		expect(warning.detail).toContain('4 seconds');
	});

	it('does not mistake the seconds field for the minute field', () => {
		// Minute is the second field here and divides evenly, so nothing should fire.
		expect(ids('0 */15 * * * *', 'seconds')).toEqual([]);
	});

	it('still catches the day OR under EventBridge numbering', () => {
		expect(ids('0 0 1 * 2 *', 'eventbridge')).toContain('day-or');
	});

	it('ignores a step in the EventBridge year, which has no cycle to wrap', () => {
		expect(ids('0 12 1 1 ? 2020-2030/5', 'eventbridge')).not.toContain('uneven-step');
	});
});
