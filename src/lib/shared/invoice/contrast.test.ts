import { describe, expect, it } from 'vitest';
import {
	contrastRatio,
	hexToRgb,
	isLightAccent,
	measurePdfContrastReport,
	resolveAccentPalette
} from './contrast';
import { extractContactLinks } from './contact-links';
import { notesConflictWithPaymentDetails } from './payment-conflict';
import { PDF_CONFIG } from './pdf-config';

describe('resolveAccentPalette', () => {
	it('uses purple for text accents when yellow is requested', () => {
		expect(isLightAccent(PDF_CONFIG.brandYellow)).toBe(true);
		const p = resolveAccentPalette(PDF_CONFIG.brandYellow);
		expect(p.textAccentHex).toBe(PDF_CONFIG.defaultAccent);
		expect(p.headerFg.r).toBe(255);
	});

	it('reports all Group A ratios ≥ 4.5 for brand purple', () => {
		const r = measurePdfContrastReport(PDF_CONFIG.defaultAccent);
		expect(r.sectionLabelOnWhite).toBeGreaterThanOrEqual(4.5);
		expect(r.tableHeaderTextOnFill).toBeGreaterThanOrEqual(4.5);
		expect(r.totalPillTextOnFill).toBeGreaterThanOrEqual(4.5);
		expect(r.bodyOnPaymentPanel).toBeGreaterThanOrEqual(4.5);
		expect(r.footerOnWhite).toBeGreaterThanOrEqual(4.5);
	});

	it('computes known contrast for black on white', () => {
		expect(contrastRatio(hexToRgb('#000000'), hexToRgb('#ffffff'))).toBeCloseTo(21, 0);
	});
});

describe('extractContactLinks', () => {
	it('finds email and phone', () => {
		const links = extractContactLinks('hello@devxhub.com · +880 1711-223344');
		expect(links.some((l) => l.kind === 'email' && l.href === 'mailto:hello@devxhub.com')).toBe(
			true
		);
		expect(links.some((l) => l.kind === 'phone')).toBe(true);
	});
});

describe('notesConflictWithPaymentDetails', () => {
	it('flags wise + bank details', () => {
		expect(notesConflictWithPaymentDetails('Please pay via Wise', true)).toBe(true);
	});
	it('flags URLs', () => {
		expect(notesConflictWithPaymentDetails('Pay at https://pay.example.com', true)).toBe(true);
	});
	it('ignores when no payment details', () => {
		expect(notesConflictWithPaymentDetails('Pay via Wise', false)).toBe(false);
	});
});
