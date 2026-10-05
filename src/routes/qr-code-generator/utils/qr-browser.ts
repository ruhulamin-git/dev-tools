/**
 * Browser-compatible QR code generator with optimized loading
 */

let qrcodeLib: any = null;
let loadingPromise: Promise<any> | null = null;

async function loadQRCode() {
	if (qrcodeLib) return qrcodeLib;
	
	// Prevent multiple simultaneous loads
	if (loadingPromise) return loadingPromise;
	
	// Use dynamic import with Vite's explicit handling
	loadingPromise = import('qrcode').then(module => {
		qrcodeLib = module;
		loadingPromise = null;
		return qrcodeLib;
	}).catch(error => {
		loadingPromise = null;
		console.error('Failed to load qrcode library:', error);
		throw error;
	});
	
	return loadingPromise;
}

export async function generateQRDataURL(
	text: string,
	options: {
		width?: number;
		margin?: number;
		color?: {
			dark?: string;
			light?: string;
		};
		errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
	} = {}
): Promise<string> {
	const QRCode = await loadQRCode();
	
	// Handle both default and named exports
	const toDataURL = QRCode.default?.toDataURL || QRCode.toDataURL;
	
	if (!toDataURL) {
		throw new Error('QRCode.toDataURL is not available');
	}
	
	return await toDataURL(text, options);
}

export async function generateQRString(
	text: string,
	options: {
		type?: 'svg';
		width?: number;
		margin?: number;
		color?: {
			dark?: string;
			light?: string;
		};
		errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
	} = {}
): Promise<string> {
	const QRCode = await loadQRCode();
	
	// Handle both default and named exports
	const toString = QRCode.default?.toString || QRCode.toString;
	
	if (!toString) {
		throw new Error('QRCode.toString is not available');
	}
	
	return await toString(text, options);
}

// Preload function for better performance
export function preloadQRCode() {
	if (typeof window !== 'undefined' && !qrcodeLib && !loadingPromise) {
		// Start loading in background
		loadQRCode().catch(() => {
			// Silently fail, will retry on actual use
		});
	}
}
