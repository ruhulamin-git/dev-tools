/**
 * PDF template presentation config (not legal copy).
 * Set `showPoweredBy: false` to suppress the Devxhub attribution line in the footer.
 */
export const PDF_CONFIG: {
	showPoweredBy: boolean;
	defaultAccent: string;
	brandYellow: string;
	columnGutterMm: number;
	footerReserveMm: number;
} = {
	/**
	 * When false, omit "Powered by Devxhub Invoice Generator" from every page footer.
	 * Read by `createInvoicePdf` — flip this flag to suppress attribution.
	 */
	showPoweredBy: true,
	/**
	 * Primary brand purple — used for all text-bearing accents
	 * (section labels, table header, total pill, payment panel tint).
	 * Yellow must never back text or appear as text on white.
	 */
	defaultAccent: '#6B21A8',
	/** Brand yellow — decorative / large non-text only; never behind text. */
	brandYellow: '#F5C800',
	/** Minimum gutter between adjacent table columns (mm). */
	columnGutterMm: 4,
	/**
	 * Reserved bottom band for the pinned footer (invoice # / thank-you).
	 * Keep tight so short invoices do not false-paginate.
	 */
	footerReserveMm: 18
};
