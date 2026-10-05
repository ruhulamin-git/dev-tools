export interface CharDiff {
	type: 'unchanged' | 'added' | 'deleted';
	text: string;
}

export interface DiffLine {
	type: 'unchanged' | 'added' | 'deleted' | 'modified';
	originalLine: number | null;
	modifiedLine: number | null;
	content: string;
	originalContent?: string;
	modifiedContent?: string;
	charDiffs?: CharDiff[];
}

export interface DiffStats {
	additions: number;
	deletions: number;
	modifications: number;
	unchanged: number;
}

export interface DiffOptions {
	ignoreWhitespace: boolean;
	characterLevelDiff: boolean;
	unifiedDiff: boolean;
	viewMode: 'unified' | 'side-by-side';
}
