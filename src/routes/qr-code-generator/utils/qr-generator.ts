import type { QRCodeData } from '../types';

export function generateQRContent(qrData: QRCodeData): string {
	let content = '';

	switch (qrData.type) {
		case 'url': {
			let url = qrData.data.url || '';
			// Add protocol if missing
			if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}
			content = url;
			break;
		}
		case 'vcard': {
			// Create universal vCard 3.0 format compatible with iOS and Android
			const vCardLines = ['BEGIN:VCARD', 'VERSION:3.0'];

			// Add name (required field) with proper structure
			if (qrData.data.name) {
				const cleanName = qrData.data.name.trim();
				// Split name into first and last name for better compatibility
				const nameParts = cleanName.split(' ');
				const lastName = nameParts.length > 1 ? nameParts.pop() : '';
				const firstName = nameParts.join(' ');

				// Standard vCard name format: N:LastName;FirstName;MiddleName;Prefix;Suffix
				vCardLines.push(`N:${lastName};${firstName};;;`);
				// Full name display
				vCardLines.push(`FN:${cleanName}`);
			}

			// Add organization
			if (qrData.data.org) {
				vCardLines.push(`ORG:${qrData.data.org}`);
			}

			// Add job title
			if (qrData.data.title) {
				vCardLines.push(`TITLE:${qrData.data.title}`);
			}

			// Add phone number with standard format
			if (qrData.data.phone) {
				// Clean phone number but keep essential formatting
				const cleanPhone = qrData.data.phone.trim();
				vCardLines.push(`TEL;TYPE=CELL:${cleanPhone}`);
			}

			// Add email
			if (qrData.data.email) {
				const cleanEmail = qrData.data.email.trim();
				vCardLines.push(`EMAIL:${cleanEmail}`);
			}

			// Add website URL
			if (qrData.data.website) {
				let websiteUrl = qrData.data.website.trim();
				// Add protocol if missing
				if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
					websiteUrl = 'https://' + websiteUrl;
				}
				vCardLines.push(`URL:${websiteUrl}`);
			}

			// Add address with simple format for maximum compatibility
			if (qrData.data.address) {
				const cleanAddress = qrData.data.address.trim();
				// Use simple address format that works across all platforms
				vCardLines.push(`ADR:;;${cleanAddress};;;;`);
			}

			vCardLines.push('END:VCARD');

			// Use standard line endings for maximum compatibility
			content = vCardLines.join('\r\n');
			break;
		}
		case 'text': {
			content = qrData.data.text || '';
			break;
		}
		case 'sms': {
			// Universal SMS format for QR codes: SMSTO:number:message
			const smsPhone = qrData.data.phone.trim();
			const smsMessage = qrData.data.message ? `:${qrData.data.message}` : '';
			content = `SMSTO:${smsPhone}${smsMessage}`;
			break;
		}
		case 'email': {
			// Standard mailto format
			const emailAddr = qrData.data.email.trim();
			const subject = qrData.data.subject
				? `subject=${encodeURIComponent(qrData.data.subject)}`
				: '';
			const body = qrData.data.message ? `body=${encodeURIComponent(qrData.data.message)}` : '';
			const params = [subject, body].filter(Boolean).join('&');
			content = `mailto:${emailAddr}${params ? '?' + params : ''}`;
			break;
		}
		case 'wifi': {
			// Standard WiFi format: WIFI:T:authentication;S:SSID;P:password;H:hidden;;
			const ssid = qrData.data.ssid.replace(/[";\\,]/g, '\\$&'); // Escape special characters
			const encryption = qrData.data.encryption || 'WPA';
			const hidden = qrData.data.hidden === 'true' ? 'true' : 'false';

			// Handle password based on encryption type
			let password = '';
			if (encryption !== 'nopass' && qrData.data.password) {
				password = qrData.data.password.replace(/[";\\,]/g, '\\$&'); // Escape special characters
			}

			content = `WIFI:T:${encryption === 'nopass' ? '' : encryption};S:${ssid};P:${password};H:${hidden};;`;
			break;
		}
		case 'phone': {
			// Standard tel format
			const phoneNumber = qrData.data.phone.trim();
			content = `tel:${phoneNumber}`;
			break;
		}
		case 'location': {
			// Standard geo format: geo:latitude,longitude
			const lat = qrData.data.latitude.trim();
			const lng = qrData.data.longitude.trim();
			const label = qrData.data.label ? `(${encodeURIComponent(qrData.data.label)})` : '';
			content = `geo:${lat},${lng}${label}`;
			break;
		}
	}

	return content;
}
