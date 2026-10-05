/**
 * A single, typed entry point for pushing events to the GTM `dataLayer`.
 *
 * Before this, analytics calls were scattered and inconsistent: some checked for `window.gtag`
 * (Footer.svelte, CompanyProfileModal.svelte) — which never fires, because this app only loads
 * GTM's `gtm.js`, never the separate `gtag.js` library, so `window.gtag` is never defined and
 * those two events have never actually reached GTM. Others (LeadMagnetInline.svelte,
 * free-invoice-generator/analytics.ts) pushed to `dataLayer` directly and correctly, but each
 * with its own inline shape. `track()` is the one place that does this correctly, respects
 * consent (see consent.ts), and never includes PII — every event name and prop here should be
 * safe to fire without a visitor's name, email or any other personal data attached.
 */

import { hasAnalyticsConsent } from './consent';

/**
 * The funnel this app measures: a visitor viewing a tool, using it, succeeding at using it
 * (copy/download), following a related-tool or CTA link, viewing or submitting the lead-magnet
 * form, searching, or opening the command palette. Each maps to a concrete, ethical
 * neuromarketing mechanism (see the design workstream) rather than tracking for its own sake.
 */
export type AnalyticsEvent =
	| 'tool_view'
	| 'tool_action'
	| 'tool_success'
	| 'related_tool_click'
	| 'lead_view'
	| 'lead_submit'
	| 'cta_view'
	| 'cta_click'
	| 'search'
	| 'palette_open'
	// Pre-existing events, carried over from their previous ad hoc call sites.
	| 'portfolio_download'
	| 'portfolio_click'
	| 'lead_magnet_download';

export interface AnalyticsProps {
	/** The tool slug an event relates to, e.g. 'hash-generator'. */
	tool?: string;
	/** A short label for what happened — the action taken, the button clicked, etc. */
	label?: string;
	[key: string]: unknown;
}

/**
 * Push an event to the GTM dataLayer, if analytics consent allows it.
 *
 * Never pass a visitor's name, email, or any other personal data as a prop — every event this
 * function sends is expected to be safe to fire unconditionally once consent is granted.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
	if (typeof window === 'undefined') return;
	if (!hasAnalyticsConsent()) return;

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event, ...props });
}
