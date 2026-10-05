import { describe, expect, it } from 'vitest';
import { amountInWords } from './amount-in-words';
import { formatInvoiceDate, formatUnambiguousDate } from './dates';
import { dueDateFromTerms } from './payment-terms';
import { invoiceNumberDateMismatchWarning, formatSequentialNumber } from './invoice-numbering';
import { addressEndsWithCountry } from './country-aliases';
import { getTaxTreatmentLabel } from './tax-treatment-labels';

describe('amountInWords', () => {
	it('uses conventional whole and fractional forms', () => {
		expect(amountInWords(40, 'USD')).toBe('US Dollars Forty only');
		expect(amountInWords(40.45, 'USD')).toBe('USD Forty and 45/100');
		expect(amountInWords(1250, 'USD')).toBe('US Dollars One Thousand Two Hundred Fifty only');
		expect(amountInWords(0, 'USD')).toBe('US Dollars Zero only');
	});
});

describe('formatInvoiceDate', () => {
	it('uses three-letter months including Sep', () => {
		expect(formatUnambiguousDate('2026-08-25')).toBe('25 Aug 2026');
		expect(formatInvoiceDate('2026-09-01', 'United Kingdom')).toBe('1 Sep 2026');
		expect(formatInvoiceDate('2026-09-01', 'United Kingdom')).not.toMatch(/Sept/);
	});

	it('never returns slash-numeric bare form', () => {
		expect(formatInvoiceDate('2026-08-25')).not.toMatch(/^\d{1,2}\/\d{1,2}\/\d/);
	});
});

describe('dueDateFromTerms', () => {
	it('computes net days from issue date', () => {
		expect(dueDateFromTerms('2026-08-25', 'Due on receipt')).toBe('2026-08-25');
		expect(dueDateFromTerms('2026-08-25', 'Net 7')).toBe('2026-09-01');
		expect(dueDateFromTerms('2026-08-25', 'Custom')).toBeNull();
	});
});

describe('invoice numbering helpers', () => {
	it('formats sequential numbers', () => {
		expect(formatSequentialNumber('inv', 2026, 1)).toBe('INV-2026-0001');
	});

	it('warns on mismatched YYYYMMDD token', () => {
		expect(invoiceNumberDateMismatchWarning('INV-20260101-1', '2026-08-25')).toMatch(
			/does not match/
		);
		expect(invoiceNumberDateMismatchWarning('INV-20260825-1', '2026-08-25')).toBeNull();
	});
});

describe('addressEndsWithCountry', () => {
	it('detects UK alias on last line', () => {
		expect(addressEndsWithCountry('London\nUK', 'United Kingdom')).toBe(true);
		expect(addressEndsWithCountry('London\nUnited Kingdom', 'United Kingdom')).toBe(true);
		expect(addressEndsWithCountry('London', 'United Kingdom')).toBe(false);
	});
});

describe('getTaxTreatmentLabel', () => {
	it('hyphenates zero-rated export', () => {
		expect(getTaxTreatmentLabel('zero_rated_export')).toBe('Zero-rated export');
	});
});
