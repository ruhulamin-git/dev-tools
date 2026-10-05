export interface DecodedJWT {
	header: Record<string, any>;
	payload: Record<string, any>;
	signature: string;
}

export interface JWTValidation {
	isValid: boolean;
	isExpired: boolean;
	expiresAt?: Date;
	message?: string;
}

export type Algorithm = 'HS256' | 'RS256';

export interface VerificationResult {
	verified: boolean;
	message: string;
}

export function decodeJWT(token: string): DecodedJWT | null {
	try {
		token = token.trim();
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
		const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
		return { header, payload, signature: parts[2] };
	} catch { return null; }
}

export function validateJWT(token: string): JWTValidation {
	try {
		const decoded = decodeJWT(token);
		if (!decoded) return { isValid: false, isExpired: false, message: 'Invalid JWT format' };
		if (decoded.payload.exp) {
			const expiresAt = new Date(decoded.payload.exp * 1000);
			const isExpired = new Date() > expiresAt;
			return { isValid: true, isExpired, expiresAt, message: isExpired ? 'Token has expired' : 'Token is valid' };
		}
		return { isValid: true, isExpired: false, message: 'Token is valid (no expiration)' };
	} catch { return { isValid: false, isExpired: false, message: 'Error validating token' }; }
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
	const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
	const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
	return bytes.buffer;
}


export async function verifyHS256(token: string, secret: string): Promise<VerificationResult> {
	try {
		if (!secret) return { verified: false, message: 'Secret key is required for HS256 verification' };
		const parts = token.trim().split('.');
		if (parts.length !== 3) return { verified: false, message: 'Invalid JWT format' };
		const [headerB64, payloadB64, signatureB64] = parts;
		const data = `${headerB64}.${payloadB64}`;
		const encoder = new TextEncoder();
		const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
		const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
		const signatureArray = new Uint8Array(signatureBuffer);
		let binaryString = '';
		for (let i = 0; i < signatureArray.length; i++) binaryString += String.fromCharCode(signatureArray[i]);
		const base64url = btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
		const verified = base64url === signatureB64;
		return { verified, message: verified ? 'Signature verified successfully' : 'Signature verification failed' };
	} catch (error: any) { return { verified: false, message: error.message || 'Signature verification failed' }; }
}

export async function verifyRS256(token: string, publicKey: string): Promise<VerificationResult> {
	try {
		if (!publicKey) return { verified: false, message: 'Public key is required for RS256 verification' };
		const parts = token.trim().split('.');
		if (parts.length !== 3) return { verified: false, message: 'Invalid JWT format' };
		const [headerB64, payloadB64, signatureB64] = parts;
		let pemKey = publicKey.trim();
		if (!pemKey.includes('BEGIN')) pemKey = `-----BEGIN PUBLIC KEY-----\n${pemKey}\n-----END PUBLIC KEY-----`;
		const pemContents = pemKey.replace(/-----BEGIN PUBLIC KEY-----/, '').replace(/-----END PUBLIC KEY-----/, '').replace(/\s/g, '');
		const binaryDer = atob(pemContents);
		const derBuffer = new Uint8Array(binaryDer.length);
		for (let i = 0; i < binaryDer.length; i++) derBuffer[i] = binaryDer.charCodeAt(i);
		const cryptoKey = await crypto.subtle.importKey('spki', derBuffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
		const encoder = new TextEncoder();
		const verified = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, base64UrlToArrayBuffer(signatureB64), encoder.encode(`${headerB64}.${payloadB64}`));
		return { verified, message: verified ? 'Signature verified successfully' : 'Signature verification failed' };
	} catch (error: any) { return { verified: false, message: error.message || 'Signature verification failed' }; }
}

export function getTimeRemaining(expiresAt: Date): string {
	const diff = expiresAt.getTime() - Date.now();
	if (diff <= 0) return 'Expired';
	const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
	if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
	if (h > 0) return `${h}h ${m}m ${s}s`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
}

export function formatJSON(obj: any): string { return JSON.stringify(obj, null, 2); }