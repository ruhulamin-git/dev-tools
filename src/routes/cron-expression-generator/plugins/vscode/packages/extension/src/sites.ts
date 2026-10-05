import * as vscode from 'vscode';
import type { Dialect } from '@devxhub/cron-core';
import { completionHit, hitsOnLine, supportsLanguage } from './detect';

/**
 * Places the hits from ./detect into a document. This is the only detection-side module that
 * knows about VS Code, which is what keeps the rules themselves testable.
 */
export interface CronSite {
	readonly expression: string;
	readonly dialect: Dialect;
	readonly range: vscode.Range;
}

export function sitesOnLine(document: vscode.TextDocument, line: number): CronSite[] {
	return hitsOnLine(document.languageId, document.lineAt(line).text).map((hit) => ({
		expression: hit.expression,
		dialect: hit.dialect,
		range: new vscode.Range(line, hit.start, line, hit.start + hit.length)
	}));
}

/** The expression under a cursor, for hover. */
export function siteAt(document: vscode.TextDocument, position: vscode.Position): CronSite | null {
	return sitesOnLine(document, position.line).find((site) => site.range.contains(position)) ?? null;
}

/** Every expression in a document, for diagnostics. */
export function allSites(document: vscode.TextDocument): CronSite[] {
	if (!supportsLanguage(document.languageId)) return [];
	const found: CronSite[] = [];
	for (let line = 0; line < document.lineCount; line += 1) {
		found.push(...sitesOnLine(document, line));
	}
	return found;
}

export interface CompletionSite {
	readonly dialect: Dialect;
	readonly range: vscode.Range;
}

export function completionSiteAt(
	document: vscode.TextDocument,
	position: vscode.Position
): CompletionSite | null {
	const before = document.lineAt(position.line).text.slice(0, position.character);
	const hit = completionHit(document.languageId, before);
	if (!hit) return null;
	return {
		dialect: hit.dialect,
		range: new vscode.Range(
			position.line,
			position.character - hit.typed.length,
			position.line,
			position.character
		)
	};
}
