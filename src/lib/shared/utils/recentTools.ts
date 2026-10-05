/**
 * "Recently used" tool tracking — purely client-side, personalized to the visitor's browser.
 *
 * This is what lets a returning visitor see *their* tools first (recognition over recall, the
 * endowment effect) instead of the same generic grid every time. Read only after mount / inside
 * an effect, never during SSR or prerendering — a prerendered page has no visitor to personalize
 * for, so this always starts empty there, correctly.
 */

const STORAGE_KEY = 'dxh_recent_tools';
const MAX_ENTRIES = 6;

export function recordToolVisit(slug: string): void {
	if (typeof window === 'undefined') return;

	try {
		const existing = getRecentToolSlugs().filter((s) => s !== slug);
		existing.unshift(slug);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, MAX_ENTRIES)));
	} catch {
		// Private browsing / storage disabled / quota exceeded — recently-used is a nice-to-have,
		// never worth surfacing an error for.
	}
}

export function getRecentToolSlugs(): string[] {
	if (typeof window === 'undefined') return [];

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
	} catch {
		return [];
	}
}
