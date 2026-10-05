export type QRCodeType = 'url' | 'vcard' | 'text' | 'sms' | 'email' | 'wifi' | 'phone' | 'location';

export type QRCodeData = {
	type: QRCodeType;
	data: Record<string, string>;
};

export type QRCodeOptions = {
	size: number;
	foregroundColor: string;
	backgroundColor: string;
	errorCorrection: 'L' | 'M' | 'Q' | 'H';
};
