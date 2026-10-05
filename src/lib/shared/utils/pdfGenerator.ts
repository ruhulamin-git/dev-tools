import { NotoBengaliBase64, NotoDevanagariBase64 } from './fonts';
import { jsPDF } from 'jspdf';
import type { InvoiceData } from '../invoice/types';
import { getTaxIdLabel } from '../invoice/tax-id-labels';
import { getTaxTreatmentStatement } from '../invoice/tax-statements';
import { formatInvoiceDate } from '../invoice/dates';
import { amountInWords } from '../invoice/amount-in-words';
import { termsLabelForPdf } from '../invoice/payment-terms';
import { PDF_CONFIG } from '../invoice/pdf-config';
import {
	resolveAccentPalette,
	measurePdfContrastReport,
	FOOTER_TEXT,
	PANEL_BODY_TEXT,
	type Rgb
} from '../invoice/contrast';
import { extractContactLinks } from '../invoice/contact-links';
import { addressEndsWithCountry } from '../invoice/country-aliases';
import { getTaxTreatmentLabel } from '../invoice/tax-treatment-labels';
import { pluralizeUnit, unitRateAbbrev } from '../invoice/units';

function formatCurrency(amount: number, symbol: string): string {
	return `${symbol}${amount.toFixed(2)}`;
}

function formatMoneyIso(amount: number, code: string): string {
	return `${code} ${amount.toFixed(2)}`;
}

function setRgb(doc: jsPDF, rgb: Rgb, mode: 'text' | 'fill' | 'draw') {
	if (mode === 'text') doc.setTextColor(rgb.r, rgb.g, rgb.b);
	else if (mode === 'fill') doc.setFillColor(rgb.r, rgb.g, rgb.b);
	else doc.setDrawColor(rgb.r, rgb.g, rgb.b);
}

/** Build the invoice PDF document (no download / preview side effects). */
export function createInvoicePdf(data: InvoiceData): jsPDF {
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	doc.addFileToVFS('NotoBengali.ttf', NotoBengaliBase64);
	doc.addFont('NotoBengali.ttf', 'NotoBengali', 'normal');
	doc.addFileToVFS('NotoDevanagari.ttf', NotoDevanagariBase64);
	doc.addFont('NotoDevanagari.ttf', 'NotoDevanagari', 'normal');

	const writeCurrency = (value: string, x: number, y: number, options?: { align?: string }) => {
		const currentFont = doc.getFont().fontName;
		const fontStyle = doc.getFont().fontStyle;
		if (value.includes('৳')) doc.setFont('NotoBengali', 'normal');
		else if (value.includes('₹')) doc.setFont('NotoDevanagari', 'normal');
		else doc.setFont('helvetica', fontStyle === 'bold' ? 'bold' : 'normal');
		doc.text(value, x, y, options as any);
		doc.setFont(currentFont, fontStyle);
	};

	const writeLinkedLine = (text: string, x: number, yPos: number, maxW?: number) => {
		const lines = maxW ? doc.splitTextToSize(text, maxW) : [text];
		doc.text(lines, x, yPos);
		const links = extractContactLinks(text);
		for (const link of links) {
			const idx = text.indexOf(link.raw);
			if (idx < 0) continue;
			const before = text.slice(0, idx);
			const linkX = x + doc.getTextWidth(before);
			const linkW = Math.max(doc.getTextWidth(link.raw), 8);
			doc.link(linkX, yPos - 3.5, linkW, 5, { url: link.href });
		}
		return Array.isArray(lines) ? lines.length : 1;
	};

	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 20;
	const contentWidth = pageWidth - margin * 2;
	const footerReserve = PDF_CONFIG.footerReserveMm;
	const contentBottom = pageHeight - footerReserve;
	const G = PDF_CONFIG.columnGutterMm;

	// Always resolve via purple-safe palette (yellow coerced inside resolveAccentPalette)
	const accentForPdf = data.accentColor || PDF_CONFIG.defaultAccent;
	const palette = resolveAccentPalette(accentForPdf);
	const currencyCode = data.currencyCode || 'USD';
	const issuerTaxLabel = getTaxIdLabel(data.selectedCountry);
	const clientTaxLabel = getTaxIdLabel(data.clientCountry);
	const showUnitColumn = data.lineItems.some((i) => !!(i.unit && i.unit.trim()));
	const taxStatement = getTaxTreatmentStatement(data.taxTreatment);
	const fmtDate = (d: string) => formatInvoiceDate(d, data.clientCountry);
	const termsLabel = termsLabelForPdf(data.paymentTermsPreset);

	/*
	 * Column geometry (right edges), ≥ G mm between adjacent column boxes:
	 *   [DESC …][QTY][UNIT?][RATE][AMOUNT]
	 * Widths sized for four-figure qty, "milestones", "$1,250.00/hr", "$12,500.00".
	 */
	const W_AMOUNT = 30;
	const W_RATE = 38;
	const W_UNIT = 28;
	const W_QTY = 18;
	const amountRight = pageWidth - margin - 2;
	const rateRight = amountRight - W_AMOUNT - G;
	const unitRight = showUnitColumn ? rateRight - W_RATE - G : rateRight;
	const qtyRight = showUnitColumn ? unitRight - W_UNIT - G : rateRight - W_RATE - G;
	const descMaxWidth = qtyRight - W_QTY - G - margin - 3;

	let y = 20;

	const ensureSpace = (neededMm: number) => {
		if (neededMm <= 0) return false;
		if (y + neededMm <= contentBottom) return false;
		doc.addPage();
		y = margin;
		return true;
	};

	const drawTableHeader = () => {
		const headerH = 10;
		setRgb(doc, palette.headerBg, 'fill');
		doc.rect(margin, y, contentWidth, headerH, 'F');
		doc.setFontSize(8);
		doc.setFont('helvetica', 'bold');
		setRgb(doc, palette.headerFg, 'text');
		const headerTextY = y + headerH / 2 + 1.5;
		doc.text('DESCRIPTION', margin + 3, headerTextY, { align: 'left' });
		doc.text('QTY', qtyRight, headerTextY, { align: 'right' });
		if (showUnitColumn) {
			doc.text('UNIT', unitRight, headerTextY, { align: 'right' });
		}
		doc.text('RATE', rateRight, headerTextY, { align: 'right' });
		doc.text('AMOUNT', amountRight, headerTextY, { align: 'right' });
		y += headerH;
	};

	// ==================== HEADER ====================
	const logoBoxW = 35;
	const logoBoxH = 15;

	if (data.logo) {
		try {
			const format = data.logo.startsWith('data:image/png')
				? 'PNG'
				: data.logo.startsWith('data:image/jpeg') || data.logo.startsWith('data:image/jpg')
					? 'JPEG'
					: data.logo.startsWith('data:image/webp')
						? 'WEBP'
						: 'PNG';
			const imgProps = doc.getImageProperties(data.logo);
			const ratio = Math.min(logoBoxW / imgProps.width, logoBoxH / imgProps.height);
			doc.addImage(
				data.logo,
				format,
				margin,
				y,
				imgProps.width * ratio,
				imgProps.height * ratio,
				undefined,
				'NONE'
			);
		} catch {
			doc.setDrawColor(200, 200, 200);
			doc.rect(margin, y, logoBoxW, logoBoxH);
			doc.setFontSize(7);
			doc.setTextColor(140, 140, 140);
			doc.text('YOUR LOGO', margin + logoBoxW / 2, y + logoBoxH / 2, { align: 'center' });
		}
	} else {
		doc.setDrawColor(200, 200, 200);
		doc.rect(margin, y, logoBoxW, logoBoxH);
		doc.setFontSize(7);
		doc.setTextColor(140, 140, 140);
		doc.text('YOUR LOGO', margin + logoBoxW / 2, y + logoBoxH / 2, { align: 'center' });
	}

	const rightX = pageWidth - margin;
	setRgb(doc, palette.label, 'text');
	doc.setFontSize(22);
	doc.setFont('helvetica', 'bold');
	doc.text('INVOICE', rightX, y + 6, { align: 'right' });

	doc.setFontSize(10);
	doc.text(`# ${data.invoiceNumber}`, rightX, y + 12, { align: 'right' });

	// Due date — second-strongest after the total bar
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(17, 17, 17);
	doc.text(`Due ${fmtDate(data.dueDate)}`, rightX, y + 20, { align: 'right' });

	doc.setFontSize(9);
	doc.setTextColor(90, 90, 90);
	doc.setFont('helvetica', 'normal');
	doc.text(`Issued ${fmtDate(data.issuedDate)}`, rightX, y + 26, { align: 'right' });
	if (termsLabel) {
		doc.text(`Terms: ${termsLabel}`, rightX, y + 31, { align: 'right' });
	}

	y = termsLabel ? 55 : 50;

	// ==================== COMPANY INFO ====================
	doc.setFontSize(12);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(17, 17, 17);
	doc.text(data.businessName || 'Devxhub Limited', margin, y);
	y += 6;

	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(90, 90, 90);
	if (data.businessAddress) {
		const lines = data.businessAddress.split('\n');
		lines.forEach((line) => {
			const n = writeLinkedLine(line, margin, y);
			y += n * 5;
		});
	}
	if (data.taxId?.trim()) {
		doc.text(`${issuerTaxLabel}: ${data.taxId.trim()}`, margin, y);
		y += 5;
	}
	if (data.businessCustomFields?.length) {
		data.businessCustomFields.forEach((field) => {
			if (field.value) {
				const text = field.name ? `${field.name}: ${field.value}` : field.value;
				const n = writeLinkedLine(text, margin, y, contentWidth / 2);
				y += n * 5;
			}
		});
	}

	y += 8;

	// ==================== DETAILS GRID ====================
	const col1X = margin;
	const col2X = pageWidth / 2 + 10;
	const col1MaxW = pageWidth / 2 - margin - 5;
	const col2MaxW = pageWidth - col2X - margin;

	doc.setFontSize(8);
	doc.setFont('helvetica', 'bold');
	setRgb(doc, palette.label, 'text');
	doc.text('BILLED TO', col1X, y);

	doc.setFontSize(10);
	doc.setTextColor(17, 17, 17);
	const clientNameLines = doc.splitTextToSize(data.clientName || 'Client Name', col1MaxW);
	doc.text(clientNameLines, col1X, y + 6);

	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(90, 90, 90);
	let clientY = y + 6 + clientNameLines.length * 5;
	if (data.clientAddress) {
		data.clientAddress.split('\n').forEach((line) => {
			const n = writeLinkedLine(line, col1X, clientY, col1MaxW);
			clientY += n * 5;
		});
	}
	if (data.clientCountry && !addressEndsWithCountry(data.clientAddress, data.clientCountry)) {
		doc.text(data.clientCountry, col1X, clientY);
		clientY += 5;
	}
	if (data.clientTaxId?.trim()) {
		doc.text(`${clientTaxLabel}: ${data.clientTaxId.trim()}`, col1X, clientY);
		clientY += 5;
	}
	if (data.clientCustomFields?.length) {
		data.clientCustomFields.forEach((field) => {
			if (field.value) {
				const text = field.name ? `${field.name}: ${field.value}` : field.value;
				const n = writeLinkedLine(text, col1X, clientY, col1MaxW);
				clientY += n * 5;
			}
		});
	}

	doc.setFontSize(8);
	doc.setFont('helvetica', 'bold');
	setRgb(doc, palette.label, 'text');
	doc.text('PROJECT', col2X, y);

	doc.setFontSize(10);
	doc.setTextColor(17, 17, 17);
	const projectNameLines = doc.splitTextToSize(data.projectName || 'Project Name', col2MaxW);
	doc.text(projectNameLines, col2X, y + 6);

	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(90, 90, 90);
	let projectY = y + 6 + projectNameLines.length * 5;
	if (data.servicePeriodStart) {
		doc.setFontSize(8);
		doc.setFont('helvetica', 'bold');
		setRgb(doc, palette.label, 'text');
		doc.text(data.servicePeriodEnd ? 'SERVICE PERIOD' : 'DELIVERY DATE', col2X, projectY);
		projectY += 5;
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(90, 90, 90);
		const serviceText = data.servicePeriodEnd
			? `${fmtDate(data.servicePeriodStart)} – ${fmtDate(data.servicePeriodEnd)}`
			: fmtDate(data.servicePeriodStart);
		doc.text(serviceText, col2X, projectY);
		projectY += 5;
	}
	if (data.projectCustomFields?.length) {
		data.projectCustomFields.forEach((field) => {
			if (field.value) {
				const text = field.name ? `${field.name}: ${field.value}` : field.value;
				const wrapped = doc.splitTextToSize(text, col2MaxW);
				doc.text(wrapped, col2X, projectY);
				projectY += wrapped.length * 5;
			}
		});
	}

	y = Math.max(clientY, projectY) + 10;

	// ==================== TABLE ====================
	const validItems = data.lineItems.filter((i) => i.description.trim() !== '');
	drawTableHeader();

	if (validItems.length === 0) {
		doc.setTextColor(170, 170, 170);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(9);
		doc.text('No items added', margin + contentWidth / 2, y + 8, { align: 'center' });
		y += 14;
	} else {
		validItems.forEach((item) => {
			const unit = item.unit?.trim() || '';
			const descLines = doc.splitTextToSize(item.description, descMaxWidth);
			const rowH = Math.max(9, descLines.length * 5 + 4);

			if (y + rowH > contentBottom) {
				doc.addPage();
				y = margin;
				drawTableHeader();
			}

			doc.setDrawColor(238, 238, 238);
			doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

			doc.setTextColor(17, 17, 17);
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(9);
			doc.text(descLines, margin + 3, y + 6, { align: 'left' });

			doc.setFont('helvetica', 'normal');
			doc.setFontSize(9);
			doc.setTextColor(90, 90, 90);
			doc.text(`${item.qty}`, qtyRight, y + 6, { align: 'right' });

			if (showUnitColumn) {
				doc.text(unit ? pluralizeUnit(unit, item.qty) : '—', unitRight, y + 6, {
					align: 'right'
				});
			}

			const rateLabel = unit
				? `${formatCurrency(item.price, data.currencySymbol)}/${unitRateAbbrev(unit)}`
				: formatCurrency(item.price, data.currencySymbol);
			writeCurrency(rateLabel, rateRight, y + 6, { align: 'right' });
			writeCurrency(formatCurrency(item.qty * item.price, data.currencySymbol), amountRight, y + 6, {
				align: 'right'
			});

			y += rowH;
		});
	}

	y += 5;

	// ==================== SUMMARY (aligned to amountRight) ====================
	const summaryLabelX = amountRight - 70;
	const estimateSummaryH = () => {
		let h = 6; // subtotal
		if (data.discount > 0) h += 6;
		h += 6; // tax always
		if (data.shipping > 0) h += 6;
		if ((data.amountPaid ?? 0) > 0) h += 14;
		h += 14; // hairline + total bar
		h += 8; // all amounts line
		if (data.showAmountInWords) h += 10;
		if (taxStatement) h += 10;
		return h;
	};

	ensureSpace(estimateSummaryH());

	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(68, 68, 68);

	const addSummaryRow = (label: string, value: string, opts?: { bold?: boolean; iso?: boolean }) => {
		if (opts?.bold) {
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(17, 17, 17);
		} else {
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(68, 68, 68);
		}
		doc.text(label, summaryLabelX, y);
		if (opts?.iso) {
			doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
			doc.text(value, amountRight, y, { align: 'right' });
		} else {
			writeCurrency(value, amountRight, y, { align: 'right' });
		}
		y += 6;
	};

	addSummaryRow('Subtotal', formatCurrency(data.subtotal, data.currencySymbol));

	if (data.discount > 0) {
		const discountAmount = data.calculatedDiscount ?? data.discount;
		if (data.discountType === 'percentage') {
			addSummaryRow(
				`Discount (${data.discount}%)`,
				`– ${formatCurrency(discountAmount, data.currencySymbol)}`
			);
		} else {
			addSummaryRow('Discount', `– ${formatCurrency(discountAmount, data.currencySymbol)}`);
		}
	}

	// Tax always renders (incl. 0.00)
	const treatmentLabel = getTaxTreatmentLabel(data.taxTreatment);
	const taxLabel = treatmentLabel ? `Tax (${treatmentLabel})` : `Tax (${data.taxPercent}%)`;
	addSummaryRow(taxLabel, formatCurrency(data.taxAmount, data.currencySymbol));

	if (data.shipping > 0) {
		addSummaryRow('Shipping', formatCurrency(data.shipping, data.currencySymbol));
	}

	const amountPaid = data.amountPaid ?? 0;
	// B8: Amount Paid unset/zero → single "Total Due". Non-zero → Amount Paid + "Balance Due".
	if (amountPaid > 0) {
		y += 1;
		addSummaryRow('Total', formatCurrency(data.total, data.currencySymbol), { bold: true });
		addSummaryRow('Amount Paid', `– ${formatCurrency(amountPaid, data.currencySymbol)}`);
	}

	// Hairline above final total
	y += 1;
	doc.setDrawColor(180, 180, 180);
	doc.setLineWidth(0.3);
	doc.line(summaryLabelX, y, amountRight, y);
	y += 5;

	const pillH = 9;
	const pillW = amountRight - summaryLabelX;
	const pillX = summaryLabelX;
	const pillY = y - 2;
	setRgb(doc, palette.headerBg, 'fill');
	doc.roundedRect(pillX, pillY, pillW, pillH, 1.5, 1.5, 'F');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(9);
	setRgb(doc, palette.headerFg, 'text');
	const pillTextY = pillY + 6;
	const pillLabel = amountPaid > 0 ? 'Balance Due' : 'Total Due';
	const pillValue = amountPaid > 0 ? (data.balanceDue ?? 0) : data.total;
	doc.text(pillLabel, pillX + 3, pillTextY);
	doc.text(formatMoneyIso(pillValue, currencyCode), amountRight - 2, pillTextY, { align: 'right' });

	y += 12;

	doc.setFontSize(8);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(102, 102, 102);
	doc.text(`All amounts in ${currencyCode}`, amountRight, y, { align: 'right' });
	y += 6;

	if (data.showAmountInWords) {
		const words = amountInWords(pillValue, currencyCode);
		doc.setFontSize(8);
		doc.setFont('helvetica', 'italic');
		doc.setTextColor(68, 68, 68);
		const wordLines = doc.splitTextToSize(`Amount in words: ${words}`, contentWidth);
		doc.text(wordLines, margin, y);
		y += wordLines.length * 4 + 4;
	}

	if (taxStatement) {
		doc.setFontSize(8);
		doc.setFont('helvetica', 'italic');
		doc.setTextColor(90, 90, 90);
		const statementLines = doc.splitTextToSize(taxStatement, contentWidth);
		doc.text(statementLines, margin, y);
		y += statementLines.length * 4 + 4;
	}

	y += 4;

	// ==================== PAYMENT DETAILS ====================
	const hasPayment = !!(
		data.bankName ||
		data.accountName ||
		data.firstName ||
		data.lastName ||
		data.accountNumber ||
		data.routingNumber ||
		data.branchName ||
		data.branchAddress ||
		data.paypalEmail ||
		data.mobileNumber ||
		data.qrCode ||
		data.intermediaryBankName ||
		data.intermediarySwiftBic ||
		data.paymentReference
	);

	if (hasPayment) {
		let paymentFields: { label: string; value: string }[] = [];

		if (data.paymentMethod === 'Bank Account') {
			let accHolder = '';
			if (data.accountType === 'Business') accHolder = data.accountName || '';
			else accHolder = `${data.firstName || ''} ${data.lastName || ''}`.trim();

			paymentFields = [
				data.bankName ? { label: 'BANK', value: data.bankName } : null,
				accHolder ? { label: 'ACCOUNT NAME', value: accHolder } : null,
				data.accountNumber ? { label: 'ACCOUNT NUMBER', value: data.accountNumber } : null,
				data.transactionType === 'International' && data.swiftBicCode
					? { label: 'SWIFT/BIC CODE', value: data.swiftBicCode }
					: null,
				data.transactionType === 'Domestic' && data.routingNumber
					? { label: 'ROUTING NUM/SORT CODE', value: data.routingNumber }
					: null,
				data.branchName ? { label: 'BRANCH NAME', value: data.branchName } : null,
				data.branchAddress ? { label: 'BRANCH ADDRESS', value: data.branchAddress } : null,
				data.transactionType === 'International' && data.intermediaryBankName
					? { label: 'INTERMEDIARY BANK', value: data.intermediaryBankName }
					: null,
				data.transactionType === 'International' && data.intermediarySwiftBic
					? { label: 'INTERMEDIARY SWIFT/BIC', value: data.intermediarySwiftBic }
					: null,
				data.transactionType === 'International' && data.chargeBearer
					? { label: 'CHARGE BEARER', value: data.chargeBearer }
					: null,
				data.transactionType === 'International' && data.paymentReference?.trim()
					? { label: 'PAYMENT REFERENCE', value: data.paymentReference.trim() }
					: null
			].filter(Boolean) as { label: string; value: string }[];
		} else if (data.paymentMethod === 'PayPal') {
			paymentFields = [
				data.paypalEmail ? { label: 'PAYPAL EMAIL / ID', value: data.paypalEmail } : null
			].filter(Boolean) as { label: string; value: string }[];
		} else if (data.paymentMethod === 'bKash' || data.paymentMethod === 'Nagad') {
			paymentFields = [
				data.mobileNumber
					? { label: `${data.paymentMethod.toUpperCase()} NUMBER`, value: data.mobileNumber }
					: null
			].filter(Boolean) as { label: string; value: string }[];
		}

		const padX = 8;
		const gapX = 8;
		doc.setFontSize(8);
		const colW = (contentWidth - padX * 2 - gapX * 2) / 3;
		const titleH = 12;
		let gridH = 0;
		const rowHeights: number[] = [];

		for (let i = 0; i < paymentFields.length; i += 3) {
			let maxLines = 1;
			for (let j = 0; j < 3 && i + j < paymentFields.length; j++) {
				const lines = doc.splitTextToSize(paymentFields[i + j].value, colW).length;
				if (lines > maxLines) maxLines = lines;
			}
			const rowH = Math.max(10, 6 + maxLines * 4);
			rowHeights.push(rowH);
			gridH += rowH;
		}

		const hasQR = !!(data.qrCode && (data.paymentMethod === 'bKash' || data.paymentMethod === 'Nagad'));
		const qrH = hasQR ? 27 : 0;
		const boxH = Math.max(30, titleH + gridH + (hasQR && paymentFields.length > 0 ? 2 : 0) + qrH + 3);

		ensureSpace(boxH + 6);

		setRgb(doc, palette.panelBg, 'fill');
		doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, 'F');
		const startBoxY = y;

		y += 6;
		doc.setFontSize(8);
		doc.setFont('helvetica', 'bold');
		setRgb(doc, palette.label, 'text');
		doc.text('PAYMENT DETAILS', margin + padX, y);
		y += 6;

		let col = 0;
		let rowIndex = 0;
		let gridY = y;

		paymentFields.forEach((field) => {
			const colX = margin + padX + col * (colW + gapX);
			doc.setFontSize(7);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(100, 100, 100);
			doc.text(field.label, colX, gridY);
			doc.setFontSize(8);
			doc.setFont('helvetica', 'bold');
			setRgb(doc, PANEL_BODY_TEXT, 'text');
			const valueLine = doc.splitTextToSize(field.value, colW);
			doc.text(valueLine, colX, gridY + 4);
			if (field.label.includes('EMAIL') || field.label.includes('PAYPAL')) {
				const links = extractContactLinks(field.value);
				for (const link of links) {
					doc.link(colX, gridY + 1, Math.min(doc.getTextWidth(field.value), colW), 5, {
						url: link.href
					});
				}
			}
			if (field.label.includes('NUMBER') && data.paymentMethod !== 'Bank Account') {
				const links = extractContactLinks(field.value);
				for (const link of links) {
					doc.link(colX, gridY + 1, Math.min(doc.getTextWidth(field.value), colW), 5, {
						url: link.href
					});
				}
			}
			col++;
			if (col >= 3) {
				col = 0;
				gridY += rowHeights[rowIndex];
				rowIndex++;
			}
		});

		const qrCodeY = gridY + (col > 0 ? 8 : 0);
		if (hasQR && data.qrCode) {
			try {
				const qrFormat = data.qrCode.startsWith('data:image/png') ? 'PNG' : 'JPEG';
				const py = paymentFields.length > 0 ? qrCodeY + 2 : y;
				doc.addImage(data.qrCode, qrFormat, margin + padX, py, 25, 25);
			} catch {
				// skip
			}
		}

		y = startBoxY + boxH + 6;
	}

	// ==================== NOTES ====================
	if (data.notes) {
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		const notesLines = doc.splitTextToSize(data.notes, contentWidth);
		const notesBlockH = 6 + notesLines.length * 5 + 8;
		ensureSpace(notesBlockH);
		doc.setFontSize(8);
		doc.setFont('helvetica', 'bold');
		setRgb(doc, palette.label, 'text');
		doc.text('NOTES & TERMS', margin, y);
		y += 6;
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(102, 102, 102);
		doc.text(notesLines, margin, y);
		y += notesLines.length * 5 + 8;
	}

	// ==================== SIGNATORY ====================
	const hasSignatory = !!(
		data.signatoryName?.trim() ||
		data.signatoryTitle?.trim() ||
		data.signatureImage
	);
	if (hasSignatory) {
		let sigH = 6 + 8;
		if (data.signatureImage) sigH += 22;
		if (data.signatoryName?.trim()) sigH += 5;
		if (data.signatoryTitle?.trim()) sigH += 8;
		ensureSpace(sigH);
		doc.setFontSize(8);
		doc.setFont('helvetica', 'bold');
		setRgb(doc, palette.label, 'text');
		doc.text('AUTHORISED SIGNATORY', margin, y);
		y += 6;

		if (data.signatureImage) {
			try {
				const format = data.signatureImage.startsWith('data:image/png')
					? 'PNG'
					: data.signatureImage.startsWith('data:image/jpeg') ||
						  data.signatureImage.startsWith('data:image/jpg')
						? 'JPEG'
						: 'PNG';
				const imgProps = doc.getImageProperties(data.signatureImage);
				const maxW = 40;
				const maxH = 18;
				const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
				doc.addImage(
					data.signatureImage,
					format,
					margin,
					y,
					imgProps.width * ratio,
					imgProps.height * ratio
				);
				y += imgProps.height * ratio + 4;
			} catch {
				// skip
			}
		}

		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(17, 17, 17);
		if (data.signatoryName?.trim()) {
			doc.text(data.signatoryName.trim(), margin, y);
			y += 5;
		}
		if (data.signatoryTitle?.trim()) {
			doc.setFontSize(9);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(90, 90, 90);
			doc.text(data.signatoryTitle.trim(), margin, y);
			y += 8;
		} else {
			y += 4;
		}
	}

	// ==================== PINNED FOOTERS (all pages) ====================
	const pageCount = doc.getNumberOfPages();
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		const footerTop = pageHeight - footerReserve + 2;

		doc.setDrawColor(221, 221, 221);
		doc.setLineWidth(0.2);
		doc.line(margin, footerTop, pageWidth - margin, footerTop);

		doc.setFontSize(8);
		doc.setFont('helvetica', 'normal');
		setRgb(doc, FOOTER_TEXT, 'text');
		doc.text(`Invoice #${data.invoiceNumber}`, margin, footerTop + 5);
		// Suppress "Page N of M" on single-page invoices
		if (pageCount > 1) {
			doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerTop + 5, { align: 'right' });
		}

		if (i === pageCount) {
			doc.setFontSize(9);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(17, 17, 17);
			doc.text(
				`Thank you for partnering with ${data.businessName || 'Devxhub'}.`,
				pageWidth / 2,
				footerTop + 10,
				{ align: 'center' }
			);
			if (PDF_CONFIG.showPoweredBy) {
				doc.setFontSize(7);
				doc.setFont('helvetica', 'normal');
				setRgb(doc, FOOTER_TEXT, 'text');
				doc.text('Powered by Devxhub Invoice Generator', pageWidth / 2, footerTop + 14.5, {
					align: 'center'
				});
			}
		}
	}

	if (typeof console !== 'undefined') {
		const report = measurePdfContrastReport(accentForPdf);
		console.info('[invoice-pdf] WCAG contrast ratios', report);
	}

	return doc;
}

export function generateInvoicePDF(data: InvoiceData): void {
	const doc = createInvoicePdf(data);
	if (data.preview) {
		const pdfBlob = doc.output('blob');
		const blobUrl = URL.createObjectURL(pdfBlob);
		window.open(blobUrl, '_blank');
	} else {
		doc.save(`invoice-${data.invoiceNumber}.pdf`);
	}
}
