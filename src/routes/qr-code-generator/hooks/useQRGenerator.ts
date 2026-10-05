import { browser } from '$app/environment';
import type { QRCodeOptions } from '../types';
import {
	formDataToQRCodeData,
	generateQRCodeImage,
	generateQRContent,
	type FormData
} from '../utils';

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

function createEmptyFormData(): FormData {
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

export function useQRGenerator() {
	let selectedType = $state('url');
	let qrCodeUrl = $state('');
	let isGenerating = $state(false);
	let error = $state('');
	let hasUserInteracted = $state(false);

	let qrSize = $state(400);
	let foregroundColor = $state('#000000');
	let backgroundColor = $state('#ffffff');
	let errorCorrection = $state<'L' | 'M' | 'Q' | 'H'>('M');

	let formData = $state<FormData>(createEmptyFormData());

	function getQRCodeData() {
		return formDataToQRCodeData(selectedType, formData);
	}

	// Get current form data as flat structure for QRCodeForm
	function getFormDataForComponent() {
		const qrData = getQRCodeData();
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

	function markUserInteraction() {
		hasUserInteracted = true;
	}

	function handleFormDataChange(newData: Record<string, string>) {
		markUserInteraction();

		// Update formData based on selected type
		switch (selectedType) {
			case 'url':
				formData.url.url = newData.url || '';
				break;
			case 'contact':
				formData.contact = {
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
				formData.text.text = newData.text || '';
				break;
			case 'sms':
				formData.sms.phone = newData.phone || '';
				formData.sms.message = newData.message || '';
				break;
			case 'email':
				formData.email.email = newData.email || '';
				formData.email.subject = newData.subject || '';
				formData.email.body = newData.message || '';
				break;
			case 'wifi':
				formData.wifi.ssid = newData.ssid || '';
				formData.wifi.password = newData.password || '';
				formData.wifi.security = newData.encryption || 'WPA';
				formData.wifi.hidden = newData.hidden === 'true';
				break;
			case 'phone':
				formData.phone.phone = newData.phone || '';
				break;
			case 'location':
				formData.location.latitude = newData.latitude || '';
				formData.location.longitude = newData.longitude || '';
				break;
		}
	}

	// Generate QR code
	async function generateQrCode(): Promise<void> {
		if (!hasUserInteracted) return;

		const qrData = getQRCodeData();
		const data = generateQRContent(qrData);

		if (!data.trim()) {
			qrCodeUrl = '';
			error = '';
			return;
		}

		isGenerating = true;
		error = '';

		try {
			const options: QRCodeOptions = {
				size: qrSize,
				foregroundColor,
				backgroundColor,
				errorCorrection
			};

			const url = await generateQRCodeImage(qrData, options);
			qrCodeUrl = url;
		} catch (err) {
			error = 'Failed to generate QR code. Please check your input.';
			qrCodeUrl = '';
			console.error('QR Code generation error:', err);
		} finally {
			isGenerating = false;
		}
	}

	// Auto-generate QR code when values change (client-side only)
	$effect(() => {
		// Skip during SSR
		if (!browser) return;

		if (hasUserInteracted) {
			generateQrCode();
		}
	});

	// Handle customization options change
	function handleOptionsChange(options: QRCodeOptions) {
		qrSize = options.size;
		foregroundColor = options.foregroundColor;
		backgroundColor = options.backgroundColor;
		errorCorrection = options.errorCorrection;
		markUserInteraction();
	}

	// Reset form when type changes
	function handleTypeChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		selectedType = target.value;
		formData = createEmptyFormData();
		error = '';
		hasUserInteracted = false;
	}

	return {
		// State
		selectedType,
		qrCodeUrl,
		isGenerating,
		error,
		qrSize,
		foregroundColor,
		backgroundColor,
		errorCorrection,
		// Methods
		getFormDataForComponent,
		handleFormDataChange,
		handleOptionsChange,
		handleTypeChange
	};
}
