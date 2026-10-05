import * as vscode from 'vscode';
import { parseCron, presets, type Dialect } from '@devxhub/cron-core';
import { completionSiteAt } from './sites';

/**
 * Descriptions are generated rather than stored, and cached because the popup asks for the
 * whole list on every keystroke.
 */
const descriptions = new Map<string, string>();

function describe(dialect: Dialect, expression: string): string | null {
	const key = `${dialect}\u0000${expression}`;
	let cached = descriptions.get(key);
	if (cached === undefined) {
		cached = parseCron(expression, dialect).description ?? '';
		descriptions.set(key, cached);
	}
	return cached === '' ? null : cached;
}

/** Offers the common schedules for whichever dialect the cursor sits in. */
export class CronCompletionProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position
	): vscode.CompletionItem[] {
		const site = completionSiteAt(document, position);
		if (!site) return [];

		const options = presets(site.dialect);
		const items: vscode.CompletionItem[] = [];

		options.forEach((expression, index) => {
			const description = describe(site.dialect, expression);
			if (!description) return;

			const item = new vscode.CompletionItem(expression, vscode.CompletionItemKind.Value);
			// Right-aligned grey text, the same place IntelliJ puts it.
			item.detail = description;
			item.documentation = new vscode.MarkdownString(`\`${expression}\`\n\n${description}`);
			// Cron is mostly spaces and asterisks, which VS Code does not treat as word
			// characters. Without an explicit range the editor guesses a replacement span
			// from the word under the cursor and mangles half-typed expressions.
			item.range = site.range;
			item.filterText = expression;
			// Preserves the curated order; without this the list re-sorts alphabetically and
			// buries @daily under */10.
			item.sortText = String(index).padStart(3, '0');
			items.push(item);
		});

		return items;
	}
}
