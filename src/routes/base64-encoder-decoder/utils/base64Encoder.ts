export type InputMode = 'text' | 'file' | 'image';
export type OperationMode = 'encode' | 'decode';

export interface Base64Options {
	urlSafe: boolean;
	removePadding: boolean;
}

export interface ProcessingResult {
	success: boolean;
	output: string;
	error?: string;
	isImage?: boolean;
	mimeType?: string;
}

export function isValidBase64(str: string): boolean {
	if (!str || str.length === 0) return false;
	const cleaned = str.replace(/\s/g, '');
	if (cleaned.length === 0) return false;
	const standardRegex = /^[A-Za-z0-9+/]*={0,2}$/;
	const urlSafeRegex = /^[A-Za-z0-9_-]*={0,2}$/;
	if (!standardRegex.test(cleaned) && !urlSafeRegex.test(cleaned)) return false;
	try {
		atob(cleaned.replace(/-/g, '+').replace(/_/g, '/'));
		return true;
	} catch { return false; }
}

export function detectBase64(input: string): boolean {
	if (!input || input.length < 4) return false;
	const trimmed = input.trim();
	if (trimmed.startsWith('data:')) return true;
	if (isValidBase64(trimmed) && trimmed.length >= 4) {
		const hasCommonWords = /\b(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out)\b/i.test(trimmed);
		return !hasCommonWords && trimmed.length > 8;
	}
	return false;
}

export function toUrlSafe(base64: string, removePadding: boolean = false): string {
	let result = base64.replace(/\+/g, '-').replace(/\//g, '_');
	if (removePadding) result = result.replace(/=+$/, '');
	return result;
}

export function fromUrlSafe(urlSafeBase64: string): string {
	let result = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
	const padding = result.length % 4;
	if (padding) result += '='.repeat(4 - padding);
	return result;
}

function uint8ArrayToBinaryString(bytes: Uint8Array): string {
	const CHUNK_SIZE = 8192;
	let result = '';
	for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
		const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
		result += String.fromCharCode.apply(null, chunk as unknown as number[]);
	}
	return result;
}


function detectMimeTypeFromBytes(bytes: Uint8Array): string | null {
	if (bytes.length < 4) return null;
	if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png';
	if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg';
	if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
	if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes.length > 11 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
	if (bytes[0] === 0x42 && bytes[1] === 0x4D) return 'image/bmp';
	return null;
}

export function encodeText(text: string, options: Base64Options): ProcessingResult {
	try {
		const utf8Bytes = new TextEncoder().encode(text);
		let base64 = btoa(uint8ArrayToBinaryString(utf8Bytes));
		if (options.urlSafe) base64 = toUrlSafe(base64, options.removePadding);
		return { success: true, output: base64 };
	} catch (error) {
		return { success: false, output: '', error: error instanceof Error ? error.message : 'Failed to encode text' };
	}
}

export function decodeText(base64: string, options: Base64Options): ProcessingResult {
	const trimmed = base64.trim();
	if (trimmed.startsWith('data:')) {
		const match = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
		if (match) return { success: true, output: trimmed, isImage: match[1].startsWith('image/'), mimeType: match[1] };
	}
	try {
		let normalized = trimmed;
		if (options.urlSafe || normalized.includes('-') || normalized.includes('_')) normalized = fromUrlSafe(normalized);
		const binaryString = atob(normalized);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
		const detectedMime = detectMimeTypeFromBytes(bytes);
		if (detectedMime?.startsWith('image/')) return { success: true, output: `data:${detectedMime};base64,${normalized}`, isImage: true, mimeType: detectedMime };
		return { success: true, output: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
	} catch { return { success: false, output: '', error: 'Invalid Base64 string or unable to decode as text' }; }
}

export function encodeFile(data: ArrayBuffer, mimeType: string, options: Base64Options): ProcessingResult {
	try {
		let base64 = btoa(uint8ArrayToBinaryString(new Uint8Array(data)));
		if (options.urlSafe) base64 = toUrlSafe(base64, options.removePadding);
		return { success: true, output: `data:${mimeType};base64,${base64}`, isImage: mimeType.startsWith('image/'), mimeType };
	} catch (error) {
		return { success: false, output: '', error: error instanceof Error ? error.message : 'Failed to encode file' };
	}
}

export function decodeFile(base64: string): ProcessingResult {
	try {
		let data = base64.trim(), mimeType = 'application/octet-stream', isImage = false;
		if (data.startsWith('data:')) {
			const match = data.match(/^data:([^;]+);base64,(.+)$/);
			if (match) { mimeType = match[1]; data = match[2]; isImage = mimeType.startsWith('image/'); }
		}
		if (data.includes('-') || data.includes('_')) data = fromUrlSafe(data);
		atob(data);
		return { success: true, output: `data:${mimeType};base64,${data}`, isImage, mimeType };
	} catch { return { success: false, output: '', error: 'Invalid Base64 string' }; }
}

export function base64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
	let data = base64;
	if (data.startsWith('data:')) {
		const match = data.match(/^data:([^;]+);base64,(.+)$/);
		if (match) { mimeType = match[1]; data = match[2]; }
	}
	if (data.includes('-') || data.includes('_')) data = fromUrlSafe(data);
	const binaryString = atob(data);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
	return new Blob([bytes], { type: mimeType });
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as ArrayBuffer);
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsArrayBuffer(file);
	});
}

export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsText(file);
	});
}
