import type { QRCodeData } from '../types';
import type { FormData } from './data-adapters';

export interface QRType {
	value: string;
	label: string;
}

export const QR_TYPES: QRType[] = [
	{ value: 'url', label: 'Website URL' },
	{ value: 'contact', label: 'Contact Card' },
	{ value: 'text', label: 'Plain Text' },
	{ value: 'sms', label: 'SMS Message' },
	{ value: 'email', label: 'Email' },
	{ value: 'wifi', label: 'WiFi Network' },
	{ value: 'phone', label: 'Phone Number' },
	{ value: 'location', label: 'GPS Location' }
];

export function createEmptyFormData(): FormData {
	return {
		url: { url: '' },
		contact: {
			firstName: '',
			lastName: '',
			organization: '',
			phone: '',
			email: '',
			website: '',
			address: ''
		},
		text: { text: '' },
		sms: { phone: '', message: '' },
		email: { email: '', subject: '', body: '' },
		wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
		phone: { phone: '' },
		location: { latitude: '', longitude: '' }
	};
}

/**
 * Update form data based on selected type and new data from form component
 */
export function updateFormDataByType(
	selectedType: string,
	formData: FormData,
	newData: Record<string, string>
): FormData {
	const updated = { ...formData };

	switch (selectedType) {
		case 'url':
			updated.url = { url: newData.url || '' };
			break;
		case 'contact':
			updated.contact = {
				firstName: newData.firstName || '',
				lastName: newData.lastName || '',
				organization: newData.organization || '',
				phone: newData.phone || '',
				email: newData.email || '',
				website: newData.website || '',
				address: newData.address || ''
			};
			break;
		case 'text':
			updated.text = { text: newData.text || '' };
			break;
		case 'sms':
			updated.sms = {
				phone: newData.phone || '',
				message: newData.message || ''
			};
			break;
		case 'email':
			updated.email = {
				email: newData.email || '',
				subject: newData.subject || '',
				body: newData.message || ''
			};
			break;
		case 'wifi':
			updated.wifi = {
				ssid: newData.ssid || '',
				password: newData.password || '',
				security: newData.encryption || 'WPA',
				hidden: newData.hidden === 'true'
			};
			break;
		case 'phone':
			updated.phone = { phone: newData.phone || '' };
			break;
		case 'location':
			updated.location = {
				latitude: newData.latitude || '',
				longitude: newData.longitude || ''
			};
			break;
	}

	return updated;
}

/**
 * Get form data in the format expected by QRCodeForm component
 */
export function getFormDataForComponent(
	selectedType: string,
	formData: FormData,
	formDataToQRCodeData: (type: string, data: FormData) => QRCodeData
): QRCodeData | { type: 'contact'; data: Record<string, string> } {
	const qrData = formDataToQRCodeData(selectedType, formData);

	if (selectedType === 'contact') {
		return {
			type: 'contact' as const,
			data: {
				firstName: formData.contact.firstName,
				lastName: formData.contact.lastName,
				organization: formData.contact.organization,
				phone: formData.contact.phone,
				email: formData.contact.email,
				website: formData.contact.website,
				address: formData.contact.address
			}
		};
	}
	return qrData;
}
