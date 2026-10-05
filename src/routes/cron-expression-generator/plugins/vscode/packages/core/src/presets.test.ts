import { describe, expect, it } from 'vitest';
import { parseCron } from './cron';
import { DIALECT_ORDER, type Dialect } from './dialects';
import { presets } from './presets';

/**
 * Written before the completion provider, on the reasoning that an invalid preset teaches a
 * syntax error in the one place a user has no reason to doubt the tool.
 */
function invalidPresets(dialect: Dialect): string[] {
	return presets(dialect)
		.map((expression) => ({ expression, result: parseCron(expression, dialect) }))
		.filter(({ result }) => !result.valid || !result.description)
		.map(({ expression, result }) => `${expression} -> ${result.error ?? 'no description'}`);
}

describe('presets', () => {
	describe('every preset is valid and describable', () => {
		for (const dialect of DIALECT_ORDER) {
			it(`${dialect}`, () => {
				expect(invalidPresets(dialect)).toEqual([]);
			});
		}
	});

	describe('shape', () => {
		it('offers no duplicates', () => {
			for (const dialect of DIALECT_ORDER) {
				const list = presets(dialect);
				expect(new Set(list).size, `duplicates in ${dialect}`).toBe(list.length);
			}
		});

		it('uses macros only where they are understood', () => {
			expect(presets('seconds').filter((p) => p.startsWith('@'))).toEqual([]);
			expect(presets('eventbridge').filter((p) => p.startsWith('@'))).toEqual([]);
			expect(presets('unix').some((p) => p.startsWith('@'))).toBe(true);
		});

		it('puts a ? in exactly one day field of every eventbridge preset', () => {
			for (const expression of presets('eventbridge')) {
				const fields = expression.split(/\s+/);
				const dayFields = [fields[2], fields[4]];
				expect(dayFields.filter((f) => f === '?').length, expression).toBe(1);
			}
		});

		it('gives every dialect the field count it expects', () => {
			expect(presets('unix').filter((p) => !p.startsWith('@')).every((p) => p.split(/\s+/).length === 5)).toBe(true);
			expect(presets('seconds').every((p) => p.split(/\s+/).length === 6)).toBe(true);
			expect(presets('eventbridge').every((p) => p.split(/\s+/).length === 6)).toBe(true);
		});
	});
});
