import * as vscode from 'vscode';
import { CronCompletionProvider } from './completion';
import { refreshDiagnostics } from './diagnostics';
import { CronHoverProvider } from './hover';

/** Every language the site rules know about, used for provider registration. */
const SELECTOR: vscode.DocumentSelector = [
	{ language: 'yaml' },
	{ language: 'github-actions-workflow' },
	{ language: 'java' },
	{ language: 'kotlin' },
	{ language: 'terraform' },
	{ language: 'tf' },
	{ language: 'hcl' }
];

export function activate(context: vscode.ExtensionContext): void {
	const diagnostics = vscode.languages.createDiagnosticCollection('cron');
	context.subscriptions.push(diagnostics);

	context.subscriptions.push(
		vscode.languages.registerHoverProvider(SELECTOR, new CronHoverProvider()),
		// Cron has no identifier characters to trigger on, so the list is offered after the
		// characters that open a value, and on an explicit Ctrl+Space.
		vscode.languages.registerCompletionItemProvider(SELECTOR, new CronCompletionProvider(), '"', "'", ' ', ':')
	);

	// Diagnostics are recomputed per document rather than per workspace: a whole-workspace scan
	// would mean parsing every YAML file on startup to find the handful with a schedule in them.
	const refresh = (document: vscode.TextDocument) => refreshDiagnostics(document, diagnostics);
	vscode.workspace.textDocuments.forEach(refresh);

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(refresh),
		vscode.workspace.onDidChangeTextDocument((event) => refresh(event.document)),
		vscode.workspace.onDidCloseTextDocument((document) => diagnostics.delete(document.uri))
	);
}

export function deactivate(): void {
	// Everything is registered through context.subscriptions, which VS Code disposes for us.
}
