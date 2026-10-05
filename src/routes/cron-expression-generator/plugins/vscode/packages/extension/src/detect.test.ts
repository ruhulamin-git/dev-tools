import { describe, expect, it } from 'vitest';
import { completionHit, hitsOnLine, looksLikeCron, supportsLanguage } from './detect';
import { forEditor } from './messages';

/**
 * The rules in ./detect are the only part of this extension with no IntelliJ counterpart --
 * there the platform parsed the file for us. They are therefore the part with no inherited
 * test coverage, and the part most likely to be quietly wrong.
 */
describe('hitsOnLine', () => {
	describe('yaml', () => {
		it('reads a Kubernetes CronJob schedule', () => {
			const [hit] = hitsOnLine('yaml', '  schedule: "0 3 * * *"');
			expect(hit).toMatchObject({ expression: '0 3 * * *', dialect: 'unix' });
		});

		it('reads a GitHub Actions sequence item', () => {
			const [hit] = hitsOnLine('yaml', "    - cron: '30 5 * * 1-5'");
			expect(hit).toMatchObject({ expression: '30 5 * * 1-5', dialect: 'unix' });
		});

		it('reads an unquoted scalar', () => {
			const [hit] = hitsOnLine('yaml', 'schedule: 0 0 1 * *');
			expect(hit?.expression).toBe('0 0 1 * *');
		});

		it('ignores a trailing comment', () => {
			const [hit] = hitsOnLine('yaml', '  schedule: "0 3 * * *" # nightly');
			expect(hit?.expression).toBe('0 3 * * *');
		});

		it('points at the expression, not at the quote or the key', () => {
			const line = '  schedule: "0 3 * * *"';
			const [hit] = hitsOnLine('yaml', line);
			expect(line.slice(hit!.start, hit!.start + hit!.length)).toBe('0 3 * * *');
		});

		it('ignores an unrelated key', () => {
			expect(hitsOnLine('yaml', '  image: "busybox:latest"')).toEqual([]);
		});
	});

	describe('java and kotlin', () => {
		it('reads @Scheduled as six-field seconds', () => {
			const [hit] = hitsOnLine('java', '    @Scheduled(cron = "0 0 3 * * *")');
			expect(hit).toMatchObject({ expression: '0 0 3 * * *', dialect: 'seconds' });
		});

		it('reads the same annotation in Kotlin', () => {
			const [hit] = hitsOnLine('kotlin', '    @Scheduled(cron = "0 30 2 * * SAT")');
			expect(hit).toMatchObject({ expression: '0 30 2 * * SAT', dialect: 'seconds' });
		});

		it('ignores a string that merely mentions cron', () => {
			expect(hitsOnLine('java', '    log.info("cron job finished");')).toEqual([]);
		});
	});

	describe('terraform', () => {
		it('unwraps an EventBridge cron(...) value', () => {
			const line = '  schedule_expression = "cron(0 12 * * ? *)"';
			const [hit] = hitsOnLine('terraform', line);
			expect(hit).toMatchObject({ expression: '0 12 * * ? *', dialect: 'eventbridge' });
			expect(line.slice(hit!.start, hit!.start + hit!.length)).toBe('0 12 * * ? *');
		});

		it('leaves rate(...) alone, because it is not cron', () => {
			expect(hitsOnLine('terraform', '  schedule_expression = "rate(5 minutes)"')).toEqual([]);
		});

		it('reads recurrence as plain unix, with no wrapper', () => {
			const [hit] = hitsOnLine('terraform', '  recurrence = "0 9 * * 1-5"');
			expect(hit).toMatchObject({ expression: '0 9 * * 1-5', dialect: 'unix' });
		});
	});

	it('finds nothing in a language it has no rules for', () => {
		expect(hitsOnLine('python', 'schedule = "0 3 * * *"')).toEqual([]);
		expect(supportsLanguage('python')).toBe(false);
		expect(supportsLanguage('yaml')).toBe(true);
	});
});

describe('completionHit', () => {
	it('offers unix in an empty YAML schedule value', () => {
		expect(completionHit('yaml', '  schedule: "')).toMatchObject({ dialect: 'unix', typed: '' });
	});

	it('offers seconds inside a half-typed @Scheduled', () => {
		expect(completionHit('java', '  @Scheduled(cron = "0 0 ')).toMatchObject({
			dialect: 'seconds',
			typed: '0 0 '
		});
	});

	it('keeps the whole typed prefix, spaces included', () => {
		// The prefix is what gets replaced. Taking only the last token would leave the
		// earlier fields behind and produce a doubled expression on accept.
		expect(completionHit('yaml', "  schedule: '*/5 * ")?.typed).toBe('*/5 * ');
	});

	it('offers eventbridge inside the cron( wrapper', () => {
		expect(completionHit('terraform', '  schedule_expression = "cron(0 ')).toMatchObject({
			dialect: 'eventbridge',
			typed: '0 '
		});
	});

	it('declines outside any schedule value', () => {
		expect(completionHit('yaml', '  image: "busy')).toBeNull();
		expect(completionHit('python', 'x = "')).toBeNull();
	});
});

describe('looksLikeCron', () => {
	// The distinction that decides whether a parse failure is reported as an error (the author
	// wrote a broken schedule) or a warning (we went looking under a key that was never a
	// schedule in the first place).
	it('accepts a broken expression that is plainly an attempt at cron', () => {
		// Five fields where EventBridge needs six: a real bug, and worth an error.
		expect(looksLikeCron('0 3 * * *')).toBe(true);
		expect(looksLikeCron('99 99 99 99 99')).toBe(true);
		expect(looksLikeCron('*/7 * * * *')).toBe(true);
	});

	it('accepts named days and months, with ranges, lists and steps', () => {
		expect(looksLikeCron('0 0 9 * * MON-FRI')).toBe(true);
		expect(looksLikeCron('0 0 1 JAN,MAR *')).toBe(true);
		expect(looksLikeCron('0 0 ? * MON/2 *')).toBe(true);
	});

	it('accepts EventBridge and Quartz punctuation', () => {
		expect(looksLikeCron('0 0 L * ? *')).toBe(true);
		expect(looksLikeCron('0 0 15W * ?')).toBe(true);
		expect(looksLikeCron('0 0 0 ? * 6#3 2027')).toBe(true);
	});

	it('accepts a macro, including a misspelled one', () => {
		expect(looksLikeCron('@daily')).toBe(true);
		expect(looksLikeCron('@daly')).toBe(true);
	});

	it('rejects prose under a schedule key', () => {
		// The case this whole predicate exists for: `schedule` is not a reserved word.
		expect(looksLikeCron('whenever the release manager says so')).toBe(false);
		expect(looksLikeCron('every 5 minutes')).toBe(false);
		expect(looksLikeCron('nightly')).toBe(false);
	});

	it('rejects a field count no dialect uses', () => {
		expect(looksLikeCron('0 3 *')).toBe(false);
		expect(looksLikeCron('0 0 0 0 0 0 0 0')).toBe(false);
	});

	it('rejects a value that merely contains numbers', () => {
		expect(looksLikeCron('release build 3 of 5')).toBe(false);
	});
});

describe('forEditor', () => {
	it('drops advice about a control the editor does not have', () => {
		// The engine is shared with the web tool, whose dialect selector sits above the input.
		const fromEngine =
			'AWS EventBridge needs 6 fields, but this has 5 fields. 5 fields is the shape of ' +
			'Unix — switch dialect above if that is what you meant.';
		expect(forEditor(fromEngine)).toBe(
			'AWS EventBridge needs 6 fields, but this has 5 fields. 5 fields is the shape of Unix.'
		);
	});

	it('leaves a message with no web-only advice alone', () => {
		expect(forEditor('hours part must be >= 0 and <= 23')).toBe('hours part must be >= 0 and <= 23');
	});
});
