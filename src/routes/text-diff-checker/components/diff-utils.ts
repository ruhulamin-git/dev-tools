import type { DiffLine, CharDiff } from './types';

interface LCSItem {
	type: 'unchanged' | 'added' | 'deleted';
	aIdx: number;
	bIdx: number;
	value: string;
}

// LCS-based diff algorithm
export function computeLCS(a: string[], b: string[]): number[][] {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array(m + 1)
		.fill(null)
		.map(() => Array(n + 1).fill(0));

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1] + 1;
			} else {
				dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
			}
		}
	}
	return dp;
}

export function backtrackLCS(
	dp: number[][],
	a: string[],
	b: string[],
	i: number,
	j: number
): LCSItem[] {
	const result: LCSItem[] = [];

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
			result.unshift({ type: 'unchanged', aIdx: i - 1, bIdx: j - 1, value: a[i - 1] });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			result.unshift({ type: 'added', aIdx: -1, bIdx: j - 1, value: b[j - 1] });
			j--;
		} else {
			result.unshift({ type: 'deleted', aIdx: i - 1, bIdx: -1, value: a[i - 1] });
			i--;
		}
	}
	return result;
}

// Character-level diff for modified lines
export function computeCharDiff(original: string, modified: string): CharDiff[] {
	const origChars = original.split('');
	const modChars = modified.split('');
	const dp = computeLCS(origChars, modChars);
	const rawDiff = backtrackLCS(dp, origChars, modChars, origChars.length, modChars.length);

	// Merge consecutive same-type diffs
	const merged: CharDiff[] = [];
	for (const item of rawDiff) {
		if (merged.length > 0 && merged[merged.length - 1].type === item.type) {
			merged[merged.length - 1].text += item.value;
		} else {
			merged.push({ type: item.type, text: item.value });
		}
	}
	return merged;
}

export function computeDiff(
	originalText: string,
	modifiedText: string,
	ignoreWhitespace: boolean,
	characterLevelDiff: boolean
): DiffLine[] {
	if (!originalText && !modifiedText) {
		return [];
	}

	const processLine = (line: string) =>
		ignoreWhitespace ? line.replace(/\s+/g, ' ').trim() : line;

	const originalLines = originalText.split('\n');
	const modifiedLines = modifiedText.split('\n');

	const processedOriginal = originalLines.map(processLine);
	const processedModified = modifiedLines.map(processLine);

	const dp = computeLCS(processedOriginal, processedModified);
	const rawDiff = backtrackLCS(
		dp,
		processedOriginal,
		processedModified,
		processedOriginal.length,
		processedModified.length
	);

	const results: DiffLine[] = [];
	let origLineNum = 0;
	let modLineNum = 0;

	for (const item of rawDiff) {
		if (item.type === 'unchanged') {
			origLineNum++;
			modLineNum++;
			results.push({
				type: 'unchanged',
				originalLine: origLineNum,
				modifiedLine: modLineNum,
				content: originalLines[item.aIdx]
			});
		} else if (item.type === 'deleted') {
			origLineNum++;
			results.push({
				type: 'deleted',
				originalLine: origLineNum,
				modifiedLine: null,
				content: originalLines[item.aIdx]
			});
		} else if (item.type === 'added') {
			modLineNum++;
			results.push({
				type: 'added',
				originalLine: null,
				modifiedLine: modLineNum,
				content: modifiedLines[item.bIdx]
			});
		}
	}

	// Post-process to detect modified lines (adjacent delete+add pairs)
	if (characterLevelDiff) {
		const finalResults: DiffLine[] = [];
		let i = 0;
		while (i < results.length) {
			if (
				i < results.length - 1 &&
				results[i].type === 'deleted' &&
				results[i + 1].type === 'added'
			) {
				const origContent = results[i].content;
				const modContent = results[i + 1].content;
				const charDiffs = computeCharDiff(origContent, modContent);

				finalResults.push({
					type: 'modified',
					originalLine: results[i].originalLine,
					modifiedLine: results[i + 1].modifiedLine,
					content: '',
					originalContent: origContent,
					modifiedContent: modContent,
					charDiffs
				});
				i += 2;
			} else {
				finalResults.push(results[i]);
				i++;
			}
		}
		return finalResults;
	}

	return results;
}

export function formatDiffForCopy(diffResults: DiffLine[], unified: boolean): string {
	if (unified) {
		return diffResults
			.map((line) => {
				if (line.type === 'modified') {
					return `- ${line.originalContent}\n+ ${line.modifiedContent}`;
				}
				const prefix = line.type === 'added' ? '+ ' : line.type === 'deleted' ? '- ' : '  ';
				return prefix + line.content;
			})
			.join('\n');
	}

	// Side-by-side format
	const maxOrigLen = Math.max(
		...diffResults.map((l) => (l.originalContent || l.content || '').length),
		40
	);
	return diffResults
		.map((line) => {
			const origContent =
				line.type === 'modified'
					? line.originalContent
					: line.type === 'deleted' || line.type === 'unchanged'
						? line.content
						: '';
			const modContent =
				line.type === 'modified'
					? line.modifiedContent
					: line.type === 'added' || line.type === 'unchanged'
						? line.content
						: '';
			const origPadded = (origContent || '').padEnd(maxOrigLen);
			return `${origPadded} | ${modContent || ''}`;
		})
		.join('\n');
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

const KEYWORDS = [
	'import',
	'export',
	'const',
	'let',
	'var',
	'function',
	'return',
	'from',
	'default',
	'if',
	'else',
	'for',
	'while',
	'class',
	'interface',
	'type',
	'async',
	'await',
	'try',
	'catch',
	'throw',
	'new',
	'this',
	'super',
	'extends',
	'implements'
];

// One combined pattern, matched in a single pass, rather than one sequential `.replace()` per
// token type. Running several passes over the same string lets a later pass re-match text an
// earlier pass just inserted — e.g. `\b(\d+)\b` (numbers) matching the "600" inside a keyword
// span's own `class="text-purple-600"` — corrupting the markup the highlighter just built.
// Matching everything here in one pass means every character of the original text is considered
// exactly once, against the original (already HTML-escaped) input, never against the
// highlighter's own output.
//
// Known cosmetic limitation, pre-existing and out of scope to redesign here: because escaping
// runs before highlighting, a quote character has already become an entity (`'` → `&#039;`) by
// the time this pattern runs, so `'...'`/`"..."` string literals are never actually detected —
// and the digits inside `&#039;` itself can get matched by the number pattern. Fixing that
// properly means recognizing string boundaries in the *original* text before escaping, which is
// a bigger change than this pass's job of making the existing behavior safe rather than broken.
const TOKEN_PATTERN = new RegExp(
	[
		`\\b(?<keyword>${KEYWORDS.join('|')})\\b`,
		`'(?<squote>[^']*)'`,
		`"(?<dquote>[^"]*)"`,
		'`(?<btick>[^`]*)`',
		`\\b(?<number>\\d+)\\b`,
		`\\/\\/(?<comment>.*)$`,
		`&lt;(?<tagopen>\\/?[a-zA-Z][a-zA-Z0-9]*)`,
		`(?<tagclose>\\/?[a-zA-Z][a-zA-Z0-9]*)&gt;`
	].join('|'),
	'gm'
);

export function syntaxHighlight(content: string): string {
	const escaped = escapeHtml(content);

	return escaped.replace(TOKEN_PATTERN, (...args) => {
		const match = args[0] as string;
		const groups = args[args.length - 1] as Record<string, string | undefined>;

		if (groups.keyword) return `<span class="text-purple-600">${groups.keyword}</span>`;
		if (groups.squote !== undefined)
			return `<span class="text-green-600">'${groups.squote}'</span>`;
		if (groups.dquote !== undefined)
			return `<span class="text-green-600">"${groups.dquote}"</span>`;
		if (groups.btick !== undefined)
			return `<span class="text-green-600">\`${groups.btick}\`</span>`;
		if (groups.number) return `<span class="text-orange-500">${groups.number}</span>`;
		if (groups.comment !== undefined)
			return `<span class="text-slate-400">//${groups.comment}</span>`;
		if (groups.tagopen) return `&lt;<span class="text-blue-600">${groups.tagopen}</span>`;
		if (groups.tagclose) return `<span class="text-blue-600">${groups.tagclose}</span>&gt;`;
		return match;
	});
}
