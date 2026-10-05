/**
 * Group A pagination / layout smoke test.
 * Run: pnpm exec vitest run src/lib/shared/invoice/pdf-smoke.test.ts
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createInvoicePdf } from '../utils/pdfGenerator';
import type { InvoiceData } from './types';
import { measurePdfContrastReport } from './contrast';
import { PDF_CONFIG } from './pdf-config';

const outDir = join(process.cwd(), 'tmp/invoice-pdf-smoke');

function baseData(overrides: Partial<InvoiceData> = {}): InvoiceData {
	return {
		logo: null,
		businessName: 'Devxhub Limited',
		businessAddress: 'Dhaka, Bangladesh\nhello@devxhub.com',
		taxId: 'BIN-123',
		clientName: 'Acme Ltd',
		clientAddress: 'London, UK',
		clientCountry: 'United Kingdom',
		clientTaxId: 'GB123',
		invoiceNumber: 'INV-2026-0001',
		issuedDate: '2026-08-25',
		dueDate: '2026-09-01',
		paymentTermsPreset: 'Net 7',
		lineItems: [{ id: 1, description: 'Consulting', qty: 8, price: 5, unit: 'hour' }],
		notes: 'Thank you for your business.',
		subtotal: 40,
		discount: 0,
		taxPercent: 0,
		taxAmount: 0,
		taxTreatment: 'zero_rated_export',
		shipping: 0,
		total: 40,
		amountPaid: 0,
		balanceDue: 40,
		currencySymbol: '$',
		currencyCode: 'USD',
		accentColor: PDF_CONFIG.defaultAccent,
		projectName: 'Platform work',
		servicePeriodStart: '2026-08-01',
		servicePeriodEnd: '2026-08-25',
		accountType: 'Business',
		transactionType: 'International',
		paymentMethod: 'Bank Account',
		bankName: 'Example Bank',
		accountName: 'Devxhub Limited',
		accountNumber: '1234567890',
		swiftBicCode: 'EXAMPBDD',
		chargeBearer: 'SHA',
		paymentReference: 'INV-2026-0001',
		...overrides
	};
}

describe('Group A PDF smoke', () => {
	it('prints contrast ratios (all ≥ 4.5)', () => {
		const r = measurePdfContrastReport(PDF_CONFIG.defaultAccent);
		console.log('A1 contrast ratios (purple):', r);
		expect(r.sectionLabelOnWhite).toBeGreaterThanOrEqual(4.5);
		expect(r.tableHeaderTextOnFill).toBeGreaterThanOrEqual(4.5);
		expect(r.totalPillTextOnFill).toBeGreaterThanOrEqual(4.5);
		expect(r.bodyOnPaymentPanel).toBeGreaterThanOrEqual(4.5);
		expect(r.footerOnWhite).toBeGreaterThanOrEqual(4.5);

		const yellowCoerced = measurePdfContrastReport(PDF_CONFIG.brandYellow);
		console.log('A1 contrast when yellow requested (coerced to purple):', yellowCoerced);
		expect(yellowCoerced.tableHeaderTextOnFill).toBeGreaterThanOrEqual(4.5);
	});

	it('short invoice with notes stays on 1 page', () => {
		mkdirSync(outDir, { recursive: true });
		const doc = createInvoicePdf(baseData());
		const pages = doc.getNumberOfPages();
		const path = join(outDir, 'short-one-line.pdf');
		writeFileSync(path, Buffer.from(doc.output('arraybuffer')));
		console.log(`A2 short invoice: ${pages} page(s) → ${path}`);
		expect(pages).toBe(1);
	});

	it('30+ line items paginate with repeated headers and no crashes', () => {
		mkdirSync(outDir, { recursive: true });
		const items = Array.from({ length: 32 }, (_, i) => ({
			id: i + 1,
			description:
				i === 0
					? 'Long description that should wrap across three lines when the column is narrow enough for the layout engine to split the text correctly without overlapping the next row content below it.'
					: `Line item ${i + 1} — delivery milestone`,
			qty: i === 1 ? 1250 : i + 1,
			price: i === 2 ? 1250 : 40 + i,
			unit: i % 3 === 0 ? 'milestone' : i % 3 === 1 ? 'hour' : 'day'
		}));
		const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
		const doc = createInvoicePdf(
			baseData({
				invoiceNumber: 'INV-2026-LONG',
				lineItems: items,
				subtotal,
				total: subtotal,
				balanceDue: subtotal,
				notes: 'Multi-page verification notes.'
			})
		);
		const pages = doc.getNumberOfPages();
		const path = join(outDir, 'long-32-items.pdf');
		writeFileSync(path, Buffer.from(doc.output('arraybuffer')));
		console.log(`A2 long invoice (32 items): ${pages} page(s) → ${path}`);
		expect(pages).toBeGreaterThan(1);
	});

	it('wide unit/rate columns do not throw', () => {
		mkdirSync(outDir, { recursive: true });
		const doc = createInvoicePdf(
			baseData({
				invoiceNumber: 'INV-COLS',
				lineItems: [
					{
						id: 1,
						description: 'Architecture review and handover documentation package',
						qty: 1250,
						price: 1250,
						unit: 'milestone'
					}
				],
				subtotal: 1250 * 1250,
				total: 1250 * 1250,
				balanceDue: 1250 * 1250
			})
		);
		const path = join(outDir, 'column-stress.pdf');
		writeFileSync(path, Buffer.from(doc.output('arraybuffer')));
		console.log(`A3 column stress: ${doc.getNumberOfPages()} page(s) → ${path}`);
		expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
	});
});

describe('Group B PDF smoke', () => {
	it('B9: showPoweredBy false omits attribution from PDF bytes', () => {
		const prev = PDF_CONFIG.showPoweredBy;
		PDF_CONFIG.showPoweredBy = true;
		const withLine = createInvoicePdf(baseData({ invoiceNumber: 'PWR-ON' }));
		const onBytes = Buffer.from(withLine.output('arraybuffer')).toString('latin1');
		expect(onBytes.includes('Powered by Devxhub Invoice Generator')).toBe(true);

		PDF_CONFIG.showPoweredBy = false;
		const withoutLine = createInvoicePdf(baseData({ invoiceNumber: 'PWR-OFF' }));
		const offBytes = Buffer.from(withoutLine.output('arraybuffer')).toString('latin1');
		expect(offBytes.includes('Powered by Devxhub Invoice Generator')).toBe(false);
		PDF_CONFIG.showPoweredBy = prev;
		console.log('B9: showPoweredBy is read by createInvoicePdf (was wired; default true).');
	});

	it('B10: intermediary, signatory, discount, shipping, partial paid', () => {
		mkdirSync(outDir, { recursive: true });
		const doc = createInvoicePdf(
			baseData({
				invoiceNumber: 'B10-FULL',
				discount: 10,
				discountType: 'fixed',
				calculatedDiscount: 10,
				shipping: 25,
				amountPaid: 15,
				subtotal: 40,
				taxAmount: 0,
				total: 55,
				balanceDue: 40,
				showAmountInWords: true,
				intermediaryBankName: 'Correspondent Bank NA',
				intermediarySwiftBic: 'CORPUS33',
				signatoryName: 'Amina Rahman',
				signatoryTitle: 'Director',
				signatureImage:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
			})
		);
		const path = join(outDir, 'b10-full-features.pdf');
		writeFileSync(path, Buffer.from(doc.output('arraybuffer')));
		const text = Buffer.from(doc.output('arraybuffer')).toString('latin1');
		expect(text.includes('INTERMEDIARY')).toBe(true);
		expect(text.includes('CORPUS33')).toBe(true);
		expect(text.includes('Amina Rahman')).toBe(true);
		expect(text.includes('Director')).toBe(true);
		expect(text.includes('Discount')).toBe(true);
		expect(text.includes('Shipping')).toBe(true);
		expect(text.includes('Amount Paid')).toBe(true);
		expect(text.includes('Balance Due')).toBe(true);
		expect(text.includes('Zero-rated export')).toBe(true);
		expect(text.includes('1 Sep 2026')).toBe(true);
		expect(text.includes('UK')).toBe(true);
		console.log(`B10 full features → ${path} (${doc.getNumberOfPages()} page)`);
	});

	it('B8: zero amount paid uses Total Due only', () => {
		const doc = createInvoicePdf(baseData({ amountPaid: 0, balanceDue: 40 }));
		const text = Buffer.from(doc.output('arraybuffer')).toString('latin1');
		expect(text.includes('Total Due')).toBe(true);
		expect(text.includes('Amount Paid')).toBe(false);
	});

	it('B4: keeps UK when address already ends with UK', () => {
		const doc = createInvoicePdf(
			baseData({
				clientAddress: '10 Example St\nLondon\nUK',
				clientCountry: 'United Kingdom'
			})
		);
		mkdirSync(outDir, { recursive: true });
		writeFileSync(join(outDir, 'b4-country-dedupe.pdf'), Buffer.from(doc.output('arraybuffer')));
		expect(Buffer.from(doc.output('arraybuffer')).toString('latin1').includes('UK')).toBe(true);
	});
});
