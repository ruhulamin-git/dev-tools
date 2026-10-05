import { browser } from '$app/environment';
import { generateQRString } from './qr-browser';

/**
 * Download QR code as PNG image
 */
export function downloadQRCode(qrCodeUrl: string, type: string): void {
	if (!browser || !qrCodeUrl) return;

	const link = document.createElement('a');
	link.download = `qr-code-${type}.png`;
	link.href = qrCodeUrl;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/**
 * Download QR code as PDF
 */
export async function downloadQRCodeAsPDF(qrCodeUrl: string): Promise<void> {
	if (!browser || !qrCodeUrl) return;

	const { jsPDF } = await import('jspdf');
	const pdf = new jsPDF();
	const imgData = qrCodeUrl;
	const imgWidth = 100;
	const imgHeight = 100;
	const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
	const y = 30;

	pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
	pdf.save('qr-code.pdf');
}

/**
 * Download QR code as SVG
 */
export async function downloadQRCodeAsSVG(
	content: string,
	type: string,
	options: {
		size: number;
		foregroundColor: string;
		backgroundColor: string;
		errorCorrection: 'L' | 'M' | 'Q' | 'H';
	}
): Promise<void> {
	if (!browser || !content) return;

	try {
		const svgString = await generateQRString(content, {
			type: 'svg',
			width: options.size,
			margin: 2,
			color: {
				dark: options.foregroundColor,
				light: options.backgroundColor
			},
			errorCorrectionLevel: options.errorCorrection
		});

		const blob = new Blob([svgString], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.download = `qr-code-${type}.svg`;
		link.href = url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error('SVG download error:', err);
		throw err;
	}
}
