import * as vscode from 'vscode';
import { lintSchedule, parseCron } from '@devxhub/cron-core';
import { looksLikeCron } from './detect';
import { forEditor } from './messages';
import { allSites } from './sites';

/**
 * Surfaces three kinds of problem through one channel, at two volumes.
 *
 * An expression that is shaped like cron and still will not parse is a real bug -- the schedule
 * the author wrote does not exist -- and is reported as an error. An expression that will not
 * parse and is not shaped like cron is far more likely to be this extension's mistake than the
 * author's: `schedule:` is not a reserved key, so prose sitting under one means our regex went
 * looking in the wrong place, and that is a warning. Lint findings are warnings for a third
 * reason -- every one of them is legal cron that merely looks unintended.
 */
export function refreshDiagnostics(
	document: vscode.TextDocument,
	collection: vscode.DiagnosticCollection
): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (const site of allSites(document)) {
		const result = parseCron(site.expression, site.dialect);

		if (!result.valid) {
			const attempted = looksLikeCron(site.expression);
			const diagnostic = new vscode.Diagnostic(
				site.range,
				attempted
					? forEditor(result.error ?? 'Invalid cron expression.')
					: 'Not a cron expression. If this value is not a schedule, this warning can be ignored.',
				attempted ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
			);
			diagnostic.source = 'cron';
			diagnostic.code = attempted ? 'invalid' : 'not-cron';
			diagnostics.push(diagnostic);
			continue;
		}

		for (const warning of lintSchedule(site.expression, result, site.dialect)) {
			const diagnostic = new vscode.Diagnostic(
				site.range,
				`${warning.title} — ${warning.detail}`,
				vscode.DiagnosticSeverity.Warning
			);
			diagnostic.source = 'cron';
			// Lets a user suppress one rule by name in problem filters, and keeps the id in
			// the UI where a bug report can quote it.
			diagnostic.code = warning.id;
			diagnostics.push(diagnostic);
		}
	}

	collection.set(document.uri, diagnostics);
}
