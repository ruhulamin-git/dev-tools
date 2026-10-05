import * as vscode from 'vscode';
import { getNextRuns, lintSchedule, parseCron } from '@devxhub/cron-core';
import { forEditor } from './messages';
import { siteAt } from './sites';

const NEXT_RUN_COUNT = 5;

function formatRun(date: Date): string {
	return date.toLocaleString(undefined, {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/** Explains the expression under the cursor: what it means, then when it next fires. */
export class CronHoverProvider implements vscode.HoverProvider {
	provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
		const site = siteAt(document, position);
		if (!site) return null;

		const result = parseCron(site.expression, site.dialect);
		const markdown = new vscode.MarkdownString();

		if (!result.valid) {
			markdown.appendMarkdown(`$(error) **Invalid cron expression**\n\n${forEditor(result.error ?? 'Could not be parsed.')}`);
			markdown.supportThemeIcons = true;
			return new vscode.Hover(markdown, site.range);
		}

		markdown.appendMarkdown(`**${result.description}**`);
		if (result.expandedFrom) {
			markdown.appendMarkdown(`\n\n\`${site.expression}\` expands to \`${result.expandedFrom}\``);
		}

		// Anchored to now, so "next runs" means next from the reader's clock rather than from
		// some fixed epoch. Rendered in the reader's locale and local zone; a cron file has no
		// timezone of its own, and guessing one would be worse than showing the machine's.
		const runs = getNextRuns(site.expression, new Date(), NEXT_RUN_COUNT, undefined, site.dialect);
		if (runs.length > 0) {
			markdown.appendMarkdown('\n\nNext runs (local time):\n');
			for (const run of runs) {
				markdown.appendMarkdown(`\n- ${formatRun(run)}`);
			}
		}

		const warnings = lintSchedule(site.expression, result, site.dialect);
		for (const warning of warnings) {
			markdown.appendMarkdown(`\n\n---\n\n**${warning.title}** — ${warning.detail}`);
		}

		return new vscode.Hover(markdown, site.range);
	}
}
