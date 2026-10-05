import { describe, expect, it } from 'vitest';
import { expandYears, shiftDayOfWeek, translate } from './dialects';
import { expandField, fieldSyntax, getNextRuns, parseCron } from './cron';

/** Fixed point so run-time assertions do not drift with the clock. */
const FROM = new Date('2026-01-01T00:00:00Z');
const iso = (dates: Date[]) => dates.map((date) => date.toISOString().slice(0, 19));

describe('shiftDayOfWeek', () => {
	it('shifts plain values from 1 = Sunday to 0 = Sunday', () => {
		expect(shiftDayOfWeek('1')).toBe('0');
		expect(shiftDayOfWeek('7')).toBe('6');
	});

	it('shifts both ends of a range', () => {
		// EventBridge MON-FRI is 2-6; Unix MON-FRI is 1-5.
		expect(shiftDayOfWeek('2-6')).toBe('1-5');
	});

	it('shifts every item of a list', () => {
		expect(shiftDayOfWeek('1,4,7')).toBe('0,3,6');
	});

	it('leaves a step interval alone — it is a count, not a weekday', () => {
		expect(shiftDayOfWeek('2-6/2')).toBe('1-5/2');
	});

	it('leaves an nth-weekday count alone', () => {
		// `2#1` is the first Monday in EventBridge; Unix spells that `1#1`.
		expect(shiftDayOfWeek('2#1')).toBe('1#1');
	});

	it('leaves names untouched', () => {
		expect(shiftDayOfWeek('MON-FRI')).toBe('MON-FRI');
		expect(shiftDayOfWeek('*')).toBe('*');
	});
});

describe('expandYears', () => {
	it('treats a wildcard as unconstrained', () => {
		expect(expandYears('*')).toBeNull();
		expect(expandYears('?')).toBeNull();
	});

	it('reads a single year, a range and a list', () => {
		expect(expandYears('2027')).toEqual([2027]);
		expect(expandYears('2027-2029')).toEqual([2027, 2028, 2029]);
		expect(expandYears('2027,2030')).toEqual([2027, 2030]);
	});

	it('reads a step', () => {
		expect(expandYears('2020-2030/5')).toEqual([2020, 2025, 2030]);
	});

	it('rejects a backwards range rather than guessing', () => {
		expect(expandYears('2030-2020')).toBeNull();
	});
});

describe('translate', () => {
	it('passes Unix and seconds forms through untouched', () => {
		expect(translate(['*/15', '9-17', '*', '*', '1-5'], 'unix')).toEqual({
			expression: '*/15 9-17 * * 1-5',
			years: null
		});
		expect(translate(['0', '*/15', '9-17', '*', '*', '1-5'], 'seconds')).toEqual({
			expression: '0 */15 9-17 * * 1-5',
			years: null
		});
	});

	it('drops the year, unsets ?, and renumbers the weekday for EventBridge', () => {
		expect(translate(['0', '18', '?', '*', '2-6', '*'], 'eventbridge')).toEqual({
			expression: '0 18 * * 1-5',
			years: null
		});
	});

	it('keeps the year constraint aside rather than discarding it', () => {
		expect(translate(['0', '12', '1', '1', '?', '2027'], 'eventbridge').years).toEqual([2027]);
	});
});

describe('the 6-field ambiguity', () => {
	// The reason dialects exist at all: the same six fields, read two ways.
	const expression = '0 18 ? * MON-FRI *';

	it('reads an EventBridge expression as 6pm, not as 18 past the hour', () => {
		const result = parseCron(expression, 'eventbridge');
		expect(result.valid).toBe(true);
		expect(result.description).toMatch(/06:00 PM/);

		const runs = iso(getNextRuns(expression, FROM, 2, 'UTC', 'eventbridge'));
		expect(runs).toEqual(['2026-01-01T18:00:00', '2026-01-02T18:00:00']);
	});

	it('does not accept that expression as a seconds-first schedule', () => {
		// Six fields, but `?` is not seconds — the dialects are not interchangeable.
		expect(parseCron(expression, 'seconds').valid).toBe(false);
	});

	it('rejects it outright under Unix, which has five fields', () => {
		expect(parseCron(expression, 'unix').valid).toBe(false);
	});
});

describe('seconds dialect', () => {
	it('describes and schedules a sub-minute interval', () => {
		const result = parseCron('*/30 * * * * *', 'seconds');
		expect(result.valid).toBe(true);
		expect(result.description).toMatch(/30 seconds/);

		expect(iso(getNextRuns('*/30 * * * * *', FROM, 3, 'UTC', 'seconds'))).toEqual([
			'2026-01-01T00:00:30',
			'2026-01-01T00:01:00',
			'2026-01-01T00:01:30'
		]);
	});

	it('names its first field Second', () => {
		expect(parseCron('0 */5 * * * *', 'seconds').fields[0].label).toBe('Second');
	});

	it('refuses macros, which are a Unix convention', () => {
		const result = parseCron('@daily', 'seconds');
		expect(result.valid).toBe(false);
		expect(result.error).toMatch(/does not accept @ shorthands/);
	});
});

describe('EventBridge weekday numbering', () => {
	it('reads 1 as Sunday, where Unix reads it as Monday', () => {
		expect(parseCron('0 12 ? * 1 *', 'eventbridge').description).toMatch(/Sunday/);
		expect(parseCron('0 12 * * 1', 'unix').description).toMatch(/Monday/);
	});

	it('schedules the day it described, not the Unix one', () => {
		// 2026-01-04 is a Sunday; 2026-01-05 is the Monday after it.
		expect(iso(getNextRuns('0 12 ? * 1 *', FROM, 1, 'UTC', 'eventbridge'))).toEqual([
			'2026-01-04T12:00:00'
		]);
		expect(iso(getNextRuns('0 12 * * 1', FROM, 1, 'UTC', 'unix'))).toEqual(['2026-01-05T12:00:00']);
	});

	it('labels weekdays by name, which cannot be misread between dialects', () => {
		expect(expandField('0 12 ? * 2-6 *', 4, 'eventbridge')?.labels).toEqual([
			'MON',
			'TUE',
			'WED',
			'THU',
			'FRI'
		]);
	});
});

describe('EventBridge year field', () => {
	it('confines the schedule to the years given', () => {
		const runs = iso(getNextRuns('0 12 1 1 ? 2027,2029', FROM, 4, 'UTC', 'eventbridge'));
		expect(runs).toEqual(['2027-01-01T12:00:00', '2029-01-01T12:00:00']);
	});

	it('returns nothing when every allowed year is in the past', () => {
		expect(getNextRuns('0 12 1 1 ? 2020', FROM, 5, 'UTC', 'eventbridge')).toEqual([]);
	});

	it('expands the year field for the breakdown', () => {
		expect(expandField('0 12 1 1 ? 2027-2029', 5, 'eventbridge')?.labels).toEqual([
			'2027',
			'2028',
			'2029'
		]);
		expect(expandField('0 12 1 1 ? *', 5, 'eventbridge')?.all).toBe(true);
	});
});

describe('per-dialect legends', () => {
	const tokens = (index: number, dialect: 'unix' | 'seconds' | 'eventbridge') =>
		fieldSyntax(index, dialect).map((row) => row.token);

	it('gives Unix weekday 0-6 and EventBridge weekday 1-7', () => {
		expect(tokens(4, 'unix')).toContain('0-6');
		expect(tokens(4, 'eventbridge')).toContain('1-7');
	});

	it('warns in the legend that EventBridge 1 is Sunday', () => {
		const sunday = fieldSyntax(4, 'eventbridge').find((row) => row.token === '1');
		expect(sunday?.meaning).toMatch(/not Monday/);
	});

	it('offers ? and # only where they are accepted', () => {
		expect(tokens(4, 'eventbridge')).toContain('?');
		expect(tokens(4, 'eventbridge')).toContain('#');
		expect(tokens(4, 'unix')).not.toContain('?');
	});

	it('describes the seconds field first in the seconds dialect', () => {
		expect(tokens(0, 'seconds')).toContain('0-59');
		expect(fieldSyntax(6, 'seconds')).toEqual([]);
	});
});
