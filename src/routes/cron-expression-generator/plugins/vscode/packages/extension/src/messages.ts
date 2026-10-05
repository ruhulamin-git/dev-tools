/**
 * Adapts engine messages for an editor.
 *
 * The engine is shared verbatim with the web tool, and a couple of its messages are written for
 * that page's UI -- they end by telling the reader to switch dialect using a control that sits
 * above the input. There is no such control here: the dialect is decided by the file type and
 * the key the expression sits under, so the advice is not merely useless but confusing.
 *
 * Rewriting here rather than in packages/core is deliberate. Editing the engine to suit this
 * consumer would fork it from the copy the web app runs, which is the one thing this layout
 * exists to prevent. The engine stays about cron; this module knows about editors.
 */
const SWITCH_DIALECT_HINT = /\s*—\s*switch dialect above[^.]*\./gu;

export function forEditor(message: string): string {
	return message.replace(SWITCH_DIALECT_HINT, '.').trim();
}
