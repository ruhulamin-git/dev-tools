import type { QRCodeData, QRCodeType } from '../types';

/**
 * FormData structure used in the page component
 */
export interface ContactData {
	firstName: string;
	lastName: string;
	organization: string;
	phone: string;
	email: string;
	website: string;
	address: string;
}

export interface FormData {
	url: { url: string };
	contact: ContactData;
	text: { text: string };
	sms: { phone: string; message: string };
	email: { email: string; subject: string; body: string };
	wifi: { ssid: string; password: string; security: string; hidden: boolean };
	phone: { phone: string };
	location: { latitude: string; longitude: string };
}

/**
 * Convert FormData structure to QRCodeData structure
 */
export function formDataToQRCodeData(type: string, formData: FormData): QRCodeData {
	const qrType = (type === 'contact' ? 'vcard' : type) as QRCodeType;
	let data: Record<string, string> = {};

	switch (type) {
		case 'url':
			data = { url: formData.url.url || '' };
			break;

		case 'contact': {
			const contact = formData.contact;
			// Convert contact structure to vcard structure
			const fullName = `${contact.firstName} ${contact.lastName}`.trim();
			data = {
				name: fullName || '',
				phone: contact.phone || '',
				email: contact.email || '',
				org: contact.organization || '',
				website: contact.website || '',
				address: contact.address || ''
			};
			break;
		}

		case 'text':
			data = { text: formData.text.text || '' };
			break;

		case 'sms':
			data = {
				phone: formData.sms.phone || '',
				message: formData.sms.message || ''
			};
			break;

		case 'email':
			data = {
				email: formData.email.email || '',
				subject: formData.email.subject || '',
				message: formData.email.body || ''
			};
			break;

		case 'wifi':
			data = {
				ssid: formData.wifi.ssid || '',
				password: formData.wifi.password || '',
				encryption: formData.wifi.security || 'WPA',
				hidden: formData.wifi.hidden ? 'true' : 'false'
			};
			break;

		case 'phone':
			data = { phone: formData.phone.phone || '' };
			break;

		case 'location':
			data = {
				latitude: formData.location.latitude || '',
				longitude: formData.location.longitude || ''
			};
			break;
	}

	return {
		type: qrType,
		data
	};
}

/**
 * Convert QRCodeData structure back to FormData structure
 */
export function qrCodeDataToFormData(qrData: QRCodeData): {
	type: string;
	formData: Partial<FormData>;
} {
	const type = qrData.type === 'vcard' ? 'contact' : qrData.type;
	let formData: Partial<FormData> = {};

	switch (qrData.type) {
		case 'url':
			formData = { url: { url: qrData.data.url || '' } };
			break;

		case 'vcard': {
			// Convert vcard structure back to contact structure
			const nameParts = (qrData.data.name || '').split(' ');
			const lastName = nameParts.length > 1 ? nameParts.pop() || '' : '';
			const firstName = nameParts.join(' ') || '';

			formData = {
				contact: {
					firstName,
					lastName,
					organization: qrData.data.org || '',
					phone: qrData.data.phone || '',
					email: qrData.data.email || '',
					website: qrData.data.website || '',
					address: qrData.data.address || ''
				}
			};
			break;
		}

		case 'text':
			formData = { text: { text: qrData.data.text || '' } };
			break;

		case 'sms':
			formData = {
				sms: {
					phone: qrData.data.phone || '',
					message: qrData.data.message || ''
				}
			};
			break;

		case 'email':
			formData = {
				email: {
					email: qrData.data.email || '',
					subject: qrData.data.subject || '',
					body: qrData.data.message || ''
				}
			};
			break;

		case 'wifi':
			formData = {
				wifi: {
					ssid: qrData.data.ssid || '',
					password: qrData.data.password || '',
					security: qrData.data.encryption || 'WPA',
					hidden: qrData.data.hidden === 'true'
				}
			};
			break;

		case 'phone':
			formData = { phone: { phone: qrData.data.phone || '' } };
			break;

		case 'location':
			formData = {
				location: {
					latitude: qrData.data.latitude || '',
					longitude: qrData.data.longitude || ''
				}
			};
			break;
	}

	return { type, formData };
}
