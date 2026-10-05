import { describe, expect, it } from 'vitest';
import {
	expandField,
	fieldIndexAtCursor,
	fieldRangeAt,
	fieldSyntax,
	getNextRuns,
	parseCron
} from './cron';
import { examplesFor, nextExample } from './examples';
import { DIALECT_ORDER } from './dialects';

describe('parseCron', () => {
	describe('valid expressions', () => {
		it('describes every minute', () => {
			const result = parseCron('* * * * *');
			expect(result.valid).toBe(true);
			expect(result.description).toBe('Every minute');
		});

		it('describes daily midnight', () => {
			const result = parseCron('0 0 * * *');
			expect(result.valid).toBe(true);
			expect(result.description).toMatch(/12:00 AM/);
		});

		it('handles step and range operators together', () => {
			const result = parseCron('*/15 9-17 * * 1-5');
			expect(result.valid).toBe(true);
			expect(result.description).toMatch(/Every 15 minutes/);
			expect(result.description).toMatch(/Monday through Friday/);
		});

		it('accepts month and day names', () => {
			expect(parseCron('0 0 * JAN MON').valid).toBe(true);
		});

		it('accepts value lists', () => {
			const result = parseCron('15 2,14 * * *');
			expect(result.valid).toBe(true);
		});

		it('tolerates irregular whitespace between fields', () => {
			const result = parseCron('  0   0  *  *  *  ');
			expect(result.valid).toBe(true);
			expect(result.fields.map((f) => f.value)).toEqual(['0', '0', '*', '*', '*']);
		});

		it('always returns five labelled fields', () => {
			const result = parseCron('5 4 * * *');
			expect(result.fields).toHaveLength(5);
			expect(result.fields.map((f) => f.name)).toEqual([
				'minute',
				'hour',
				'dayOfMonth',
				'month',
				'dayOfWeek'
			]);
		});
	});

	describe('day-of-month / day-of-week OR logic', () => {
		// Cron ORs these two fields when both are restricted. The description has to
		// surface both, or users read it as an AND and schedule the wrong job.
		it('mentions both the day of month and the weekday', () => {
			const result = parseCron('5 4 4 9 6');
			expect(result.valid).toBe(true);
			expect(result.description).toMatch(/day 4 of the month/i);
			expect(result.description).toMatch(/Saturday/i);
			expect(result.description).toMatch(/September/i);
		});

		it('fires on either match, not only on days satisfying both', () => {
			// September 2027: the 4th is a Saturday, but the 11th is a Saturday too and
			// the 4th of other months also matches. Within September 2026 the run list
			// must include Saturdays that are not the 4th.
			const runs = getNextRuns('5 4 4 9 6', new Date('2026-09-01T00:00:00Z'), 5, 'UTC');
			const days = runs.map((d) => d.getUTCDate());
			expect(days).toContain(4);
			expect(days.some((day) => day !== 4)).toBe(true);
		});
	});

	describe('macros', () => {
		it('expands @daily', () => {
			const result = parseCron('@daily');
			expect(result.valid).toBe(true);
			expect(result.expandedFrom).toBe('@daily');
			expect(result.fields.map((f) => f.value)).toEqual(['0', '0', '*', '*', '*']);
		});

		it('is case-insensitive', () => {
			expect(parseCron('@DAILY').valid).toBe(true);
		});

		it('rejects @reboot with an explanation', () => {
			const result = parseCron('@reboot');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/startup/i);
		});

		it('rejects unknown shorthands', () => {
			const result = parseCron('@fortnightly');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/@hourly/);
		});
	});

	describe('invalid expressions', () => {
		it('reports an empty input without sounding like an error', () => {
			const result = parseCron('   ');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/Enter a cron expression/);
		});

		it('rejects four fields and says how many it found', () => {
			const result = parseCron('* * * *');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/needs 5 fields/);
			expect(result.error).toMatch(/has 4 fields/);
		});

		it('rejects six fields and points at the dialect that takes them', () => {
			const result = parseCron('0 0 0 * * *');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/needs 5 fields/);
			expect(result.error).toMatch(/Seconds or AWS EventBridge/);
		});

		it('rejects out-of-range minutes', () => {
			expect(parseCron('60 * * * *').valid).toBe(false);
		});

		it('rejects out-of-range hours', () => {
			expect(parseCron('0 24 * * *').valid).toBe(false);
		});

		it('rejects out-of-range day of month', () => {
			expect(parseCron('0 0 32 * *').valid).toBe(false);
		});

		it('rejects out-of-range months', () => {
			expect(parseCron('0 0 * 13 *').valid).toBe(false);
		});

		it('rejects a backwards range and explains the direction', () => {
			const result = parseCron('0 0 * * 5-1');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/runs backwards/);
			expect(result.error).toMatch(/5-1/);
		});

		it('rejects a zero step and suggests a real interval', () => {
			const result = parseCron('*/0 * * * *');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/\*\/1 or higher/);
		});

		it('rejects a date that can never occur, in plain language', () => {
			// February has no 31st, so this schedule would never fire.
			const result = parseCron('0 0 31 2 *');
			expect(result.valid).toBe(false);
			expect(result.error).toMatch(/never occurs/);
			expect(result.error).not.toMatch(/definition/);
		});

		it('passes cronstrue range messages through unchanged', () => {
			expect(parseCron('60 * * * *').error).toBe('minutes part must be >= 0 and <= 59');
		});

		it('never leaks a raw "Error:" prefix into the message', () => {
			for (const bad of ['60 * * * *', '0 0 31 2 *', '*/0 * * * *', 'a b c d e']) {
				expect(parseCron(bad).error, bad).not.toMatch(/^Error:/);
			}
		});

		it('rejects free text', () => {
			expect(parseCron('every tuesday please').valid).toBe(false);
		});

		it('still returns five fields when invalid, so the breakdown keeps rendering', () => {
			const result = parseCron('60 * * * *');
			expect(result.fields).toHaveLength(5);
		});
	});
});

describe('getNextRuns', () => {
	it('returns the requested number of runs', () => {
		const runs = getNextRuns('*/15 * * * *', new Date('2026-09-02T10:07:00Z'), 5, 'UTC');
		expect(runs).toHaveLength(5);
	});

	it('computes runs relative to the date it is given, not the clock', () => {
		const from = new Date('2026-09-02T10:07:00Z');
		const runs = getNextRuns('*/15 9-17 * * 1-5', from, 3, 'UTC');
		expect(runs.map((d) => d.toISOString())).toEqual([
			'2026-09-02T10:15:00.000Z',
			'2026-09-02T10:30:00.000Z',
			'2026-09-02T10:45:00.000Z'
		]);
	});

	it('returns strictly increasing times', () => {
		const runs = getNextRuns('0 0 * * *', new Date('2026-09-02T10:00:00Z'), 5, 'UTC');
		for (let i = 1; i < runs.length; i++) {
			expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime());
		}
	});

	it('skips Feb 29 in non-leap years', () => {
		const runs = getNextRuns('0 0 29 2 *', new Date('2026-01-01T00:00:00Z'), 2, 'UTC');
		// 2028 and 2032 are the next leap years; 2027 has no Feb 29 to land on.
		expect(runs[0].getUTCFullYear()).toBe(2028);
		expect(runs[0].getUTCMonth()).toBe(1);
		expect(runs[0].getUTCDate()).toBe(29);
		expect(runs[1].getUTCFullYear()).toBe(2032);
	});

	it('skips months that have no 31st', () => {
		const runs = getNextRuns('0 0 31 * *', new Date('2026-04-01T00:00:00Z'), 3, 'UTC');
		const months = runs.map((d) => d.getUTCMonth());
		// April, June, September, November have no 31st.
		expect(months).not.toContain(3);
		expect(months).not.toContain(5);
		expect(runs.every((d) => d.getUTCDate() === 31)).toBe(true);
	});

	it('crosses a year boundary', () => {
		const runs = getNextRuns('0 0 1 1 *', new Date('2026-06-01T00:00:00Z'), 2, 'UTC');
		expect(runs[0].getUTCFullYear()).toBe(2027);
		expect(runs[1].getUTCFullYear()).toBe(2028);
	});

	it('resolves macros', () => {
		const runs = getNextRuns('@hourly', new Date('2026-09-02T10:07:00Z'), 1, 'UTC');
		expect(runs[0].toISOString()).toBe('2026-09-02T11:00:00.000Z');
	});

	it('returns an empty list for an invalid expression instead of throwing', () => {
		expect(getNextRuns('nonsense', new Date())).toEqual([]);
	});
});

describe('fieldSyntax', () => {
	const tokens = (index: number) => fieldSyntax(index).map((row) => row.token);

	it('lists the operators every field shares', () => {
		for (let index = 0; index < 5; index++) {
			expect(tokens(index).slice(0, 4)).toEqual(['*', ',', '-', '/']);
		}
	});

	it('gives each field its own allowed range', () => {
		expect(tokens(0)).toContain('0-59');
		expect(tokens(1)).toContain('0-23');
		expect(tokens(2)).toContain('1-31');
		expect(tokens(3)).toContain('1-12');
		expect(tokens(4)).toContain('0-6');
	});

	it('offers the name forms for month and day of week', () => {
		expect(tokens(3)).toContain('JAN-DEC');
		expect(tokens(4)).toContain('SUN-SAT');
	});

	it('flags 7 as a non-standard Sunday, on the weekday field only', () => {
		const sunday = fieldSyntax(4).find((row) => row.token === '7');
		expect(sunday?.meaning).toBe('sunday (non-standard)');
		expect(tokens(0)).not.toContain('7');
	});

	it('returns nothing outside the five fields', () => {
		expect(fieldSyntax(-1)).toEqual([]);
		expect(fieldSyntax(5)).toEqual([]);
	});
});

describe('expandField', () => {
	it('expands a step into the values it matches', () => {
		expect(expandField('*/15 9-17 * * 1-5', 0)).toEqual({
			labels: ['0', '15', '30', '45'],
			all: false
		});
	});

	it('expands a range', () => {
		expect(expandField('*/15 9-17 * * 1-5', 1)?.labels).toEqual([
			'9',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'17'
		]);
	});

	it('names months rather than numbering them', () => {
		expect(expandField('0 0 1 1,6,12 *', 3)?.labels).toEqual(['JAN', 'JUN', 'DEC']);
	});

	it('names days of the week', () => {
		expect(expandField('0 0 * * 1-5', 4)?.labels).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI']);
	});

	it('flags a field that matches everything', () => {
		expect(expandField('0 0 * * *', 2)?.all).toBe(true);
		expect(expandField('0 0 * * *', 4)?.all).toBe(true);
	});

	it('collapses the two spellings of Sunday', () => {
		// cron accepts both 0 and 7 for Sunday, so `0,7` must not list it twice.
		expect(expandField('0 0 * * 0,7', 4)?.labels).toEqual(['SUN']);
		// `*` arrives from the parser as 0-7 for the same reason.
		expect(expandField('0 0 * * *', 4)?.labels).toHaveLength(7);
	});

	it('keeps a literal day-of-month value as written', () => {
		const expanded = expandField('0 0 L * *', 2);
		expect(expanded?.labels).toEqual(['L']);
		expect(expanded?.all).toBe(false);
	});

	it('expands a macro through its expansion', () => {
		expect(expandField('@hourly', 0)?.labels).toEqual(['0']);
	});

	it('returns null for an invalid expression', () => {
		expect(expandField('nonsense', 0)).toBeNull();
	});

	it('returns null outside the five fields', () => {
		expect(expandField('0 0 * * *', -1)).toBeNull();
		expect(expandField('0 0 * * *', 5)).toBeNull();
	});
});

describe('fieldRangeAt', () => {
	const expression = '*/15 9-17 * * 1-5';

	it('covers the first field', () => {
		expect(fieldRangeAt(expression, 0)).toEqual([0, 4]);
		expect(expression.slice(0, 4)).toBe('*/15');
	});

	it('covers a middle field', () => {
		const range = fieldRangeAt(expression, 1);
		expect(range).toEqual([5, 9]);
		expect(expression.slice(range![0], range![1])).toBe('9-17');
	});

	it('covers the last field', () => {
		const range = fieldRangeAt(expression, 4);
		expect(expression.slice(range![0], range![1])).toBe('1-5');
	});

	it('handles leading and repeated whitespace', () => {
		const messy = '  0   0 * * *';
		const range = fieldRangeAt(messy, 1);
		expect(messy.slice(range![0], range![1])).toBe('0');
		expect(range![0]).toBe(6);
	});

	it('starts where the caret lookup agrees the field starts', () => {
		// The two helpers have to line up, or clicking a card would highlight a different card.
		for (let index = 0; index < 5; index++) {
			const range = fieldRangeAt(expression, index);
			expect(fieldIndexAtCursor(expression, range![0])).toBe(index);
		}
	});

	it('returns null for a field that has not been typed yet', () => {
		expect(fieldRangeAt('0 0', 3)).toBeNull();
	});

	it('returns null outside the five fields', () => {
		expect(fieldRangeAt(expression, -1)).toBeNull();
		expect(fieldRangeAt('* * * * * *', 5)).toBeNull();
	});

	it('returns null for macros, whose fields are an expansion with no text to select', () => {
		expect(fieldRangeAt('@daily', 0)).toBeNull();
	});
});

describe('fieldIndexAtCursor', () => {
	it('finds the first field', () => {
		expect(fieldIndexAtCursor('*/15 9-17 * * 1-5', 2)).toBe(0);
	});

	it('finds a middle field', () => {
		expect(fieldIndexAtCursor('*/15 9-17 * * 1-5', 7)).toBe(1);
	});

	it('finds the last field', () => {
		expect(fieldIndexAtCursor('*/15 9-17 * * 1-5', 17)).toBe(4);
	});

	it('moves to the next field once a space is typed', () => {
		expect(fieldIndexAtCursor('0 ', 2)).toBe(1);
	});

	it('returns -1 past the last field', () => {
		expect(fieldIndexAtCursor('* * * * * ', 10)).toBe(-1);
	});

	it('returns -1 for macros, which have no fields to highlight', () => {
		expect(fieldIndexAtCursor('@daily', 3)).toBe(-1);
	});

	it('ignores leading whitespace', () => {
		expect(fieldIndexAtCursor('  0 0 * * *', 3)).toBe(0);
	});
});

describe('examples', () => {
	for (const dialect of DIALECT_ORDER) {
		describe(dialect, () => {
			const examples = examplesFor(dialect);

			it('are all valid in their own dialect', () => {
				for (const example of examples) {
					expect(parseCron(example.expression, dialect).valid, example.expression).toBe(true);
				}
			});

			it('are unique', () => {
				const expressions = examples.map((e) => e.expression);
				expect(new Set(expressions).size).toBe(expressions.length);
			});

			it('cycle in order and wrap around', () => {
				expect(nextExample(examples[0].expression, dialect)).toEqual(examples[1]);
				expect(nextExample(examples[examples.length - 1].expression, dialect)).toEqual(examples[0]);
			});

			it('start at the first example when the input is not one of them', () => {
				expect(nextExample('nothing like an example', dialect)).toEqual(examples[0]);
			});
		});
	}

	it('give each dialect its own set', () => {
		// A Unix expression pasted into EventBridge is not valid there, so the lists must differ.
		expect(examplesFor('unix')).not.toEqual(examplesFor('seconds'));
		expect(examplesFor('seconds')).not.toEqual(examplesFor('eventbridge'));
	});
});
