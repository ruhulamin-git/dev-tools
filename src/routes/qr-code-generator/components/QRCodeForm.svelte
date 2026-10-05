<script lang="ts">
	import type { QRCodeData, QRCodeType } from '../types';
	import { Input, Textarea, Select, Checkbox, Label } from '$lib/shared/components/ui';

	type Props = {
		selectedType: QRCodeType | 'contact' | string;
		qrData: QRCodeData | { type: 'contact'; data: Record<string, string> };
		onDataChange: (data: Record<string, string>) => void;
	};

	let { selectedType, qrData, onDataChange }: Props = $props();

	function updateData(field: string, value: string | boolean) {
		const newData = { ...qrData.data };
		newData[field] = typeof value === 'boolean' ? String(value) : value;
		onDataChange(newData);
	}

	function handleInput(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLInputElement | HTMLTextAreaElement;
			updateData(field, target.value);
		};
	}

	function handleCheckbox(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLInputElement;
			updateData(field, target.checked);
		};
	}

	function handleSelect(field: string) {
		return (e: Event) => {
			const target = e.target as HTMLSelectElement;
			updateData(field, target.value);
		};
	}
</script>

{#if selectedType === 'url'}
	<div class="space-y-2">
		<Label htmlFor="url-input">Website URL</Label>
		<Input
			id="url-input"
			type="url"
			placeholder="https://example.com"
			value={qrData.data.url || ''}
			oninput={handleInput('url')}
			ariaLabel="Website URL"
		/>
	</div>
{:else if selectedType === 'contact'}
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label htmlFor="contact-firstname">First Name</Label>
				<Input
					id="contact-firstname"
					type="text"
					value={qrData.data.firstName || ''}
					oninput={handleInput('firstName')}
					placeholder="John"
				/>
			</div>
			<div class="space-y-2">
				<Label htmlFor="contact-lastname">Last Name</Label>
				<Input
					id="contact-lastname"
					type="text"
					value={qrData.data.lastName || ''}
					oninput={handleInput('lastName')}
					placeholder="Doe"
				/>
			</div>
		</div>
		<div class="space-y-2">
			<Label htmlFor="contact-org">Company</Label>
			<Input
				id="contact-org"
				type="text"
				value={qrData.data.organization || ''}
				oninput={handleInput('organization')}
				placeholder="Company Inc."
			/>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label htmlFor="contact-phone">Phone</Label>
				<Input
					id="contact-phone"
					type="tel"
					value={qrData.data.phone || ''}
					oninput={handleInput('phone')}
					placeholder="+1234567890"
				/>
			</div>
			<div class="space-y-2">
				<Label htmlFor="contact-email">Email</Label>
				<Input
					id="contact-email"
					type="email"
					value={qrData.data.email || ''}
					oninput={handleInput('email')}
					placeholder="john@example.com"
				/>
			</div>
		</div>
		<div class="space-y-2">
			<Label htmlFor="contact-website">Website</Label>
			<Input
				id="contact-website"
				type="url"
				value={qrData.data.website || ''}
				oninput={handleInput('website')}
				placeholder="https://example.com"
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="contact-address">Address</Label>
			<Textarea
				id="contact-address"
				value={qrData.data.address || ''}
				oninput={handleInput('address')}
				placeholder="123 Street Name, City"
				rows={3}
			/>
		</div>
	</div>
{:else if selectedType === 'vcard'}
	<div class="space-y-4">
		<div class="space-y-2">
			<Label htmlFor="vcard-name">Full Name</Label>
			<Input
				id="vcard-name"
				placeholder="John Doe"
				value={qrData.data.name || ''}
				oninput={handleInput('name')}
			/>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label htmlFor="vcard-phone">Phone Number</Label>
				<Input
					id="vcard-phone"
					placeholder="+1234567890"
					value={qrData.data.phone || ''}
					oninput={handleInput('phone')}
				/>
			</div>
			<div class="space-y-2">
				<Label htmlFor="vcard-email">Email Address</Label>
				<Input
					id="vcard-email"
					placeholder="john@example.com"
					value={qrData.data.email || ''}
					oninput={handleInput('email')}
				/>
			</div>
		</div>
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label htmlFor="vcard-org">Company</Label>
				<Input
					id="vcard-org"
					placeholder="Company Inc."
					value={qrData.data.org || ''}
					oninput={handleInput('org')}
				/>
			</div>
			<div class="space-y-2">
				<Label htmlFor="vcard-title">Job Title</Label>
				<Input
					id="vcard-title"
					placeholder="Manager"
					value={qrData.data.title || ''}
					oninput={handleInput('title')}
				/>
			</div>
		</div>
		<div class="space-y-2">
			<Label htmlFor="vcard-website">Website URL</Label>
			<Input
				id="vcard-website"
				placeholder="https://example.com"
				value={qrData.data.website || ''}
				oninput={handleInput('website')}
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="vcard-address">Address</Label>
			<Textarea
				id="vcard-address"
				placeholder="123 Street Name, City"
				rows={3}
				value={qrData.data.address || ''}
				oninput={handleInput('address')}
			/>
		</div>
	</div>
{:else if selectedType === 'text'}
	<div class="space-y-2">
		<Label htmlFor="text-content">Text Content</Label>
		<Textarea
			id="text-content"
			rows={5}
			value={qrData.data.text || ''}
			oninput={handleInput('text')}
			placeholder="Enter your text here..."
		/>
	</div>
{:else if selectedType === 'sms'}
	<div class="space-y-4">
		<div class="space-y-2">
			<Label htmlFor="sms-phone">Phone Number</Label>
			<Input
				id="sms-phone"
				placeholder="+1234567890"
				value={qrData.data.phone || ''}
				oninput={handleInput('phone')}
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="sms-message">Message</Label>
			<Textarea
				id="sms-message"
				placeholder="Type your message..."
				value={qrData.data.message || ''}
				oninput={handleInput('message')}
				rows={4}
			/>
		</div>
	</div>
{:else if selectedType === 'email'}
	<div class="space-y-4">
		<div class="space-y-2">
			<Label htmlFor="email-addr">Email Address</Label>
			<Input
				id="email-addr"
				placeholder="recipient@example.com"
				value={qrData.data.email || ''}
				oninput={handleInput('email')}
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="email-subject">Subject</Label>
			<Input
				id="email-subject"
				placeholder="Email Subject"
				value={qrData.data.subject || ''}
				oninput={handleInput('subject')}
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="email-message">Message</Label>
			<Textarea
				id="email-message"
				placeholder="Type your email content..."
				value={qrData.data.message || ''}
				oninput={handleInput('message')}
				rows={5}
			/>
		</div>
	</div>
{:else if selectedType === 'wifi'}
	<div class="space-y-4">
		<div class="space-y-2">
			<Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
			<Input
				id="wifi-ssid"
				placeholder="MyNetwork"
				value={qrData.data.ssid || ''}
				oninput={handleInput('ssid')}
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="wifi-password">Password</Label>
			<Input
				id="wifi-password"
				placeholder="Network Password"
				type="password"
				value={qrData.data.password || ''}
				oninput={handleInput('password')}
			/>
		</div>
		<div class="space-y-2">
			<Label htmlFor="wifi-encryption">Security Type</Label>
			<Select
				id="wifi-encryption"
				value={qrData.data.encryption || ''}
				onchange={(val) => handleSelect('encryption')({ target: { value: val } } as any)}
				options={[
					{ value: '', label: 'Select Security Type' },
					{ value: 'WPA', label: 'WPA/WPA2/WPA3' },
					{ value: 'WEP', label: 'WEP (Legacy)' },
					{ value: 'nopass', label: 'Open Network (No Password)' }
				]}
			/>
		</div>
		<div class="flex items-center space-x-2 pt-2">
			<Checkbox
				id="wifi-hidden"
				checked={qrData.data.hidden === 'true'}
				onchange={handleCheckbox('hidden')}
			/>
			<Label htmlFor="wifi-hidden" class="cursor-pointer font-normal">Hidden Network</Label>
		</div>
	</div>
{:else if selectedType === 'phone'}
	<div class="space-y-2">
		<Label htmlFor="phone-number">Phone Number</Label>
		<Input
			id="phone-number"
			placeholder="+1-555-123-4567"
			value={qrData.data.phone || ''}
			oninput={handleInput('phone')}
		/>
	</div>
{:else if selectedType === 'location'}
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label htmlFor="loc-lat">Latitude</Label>
				<Input
					id="loc-lat"
					placeholder="37.7749"
					value={qrData.data.latitude || ''}
					oninput={handleInput('latitude')}
				/>
			</div>
			<div class="space-y-2">
				<Label htmlFor="loc-long">Longitude</Label>
				<Input
					id="loc-long"
					placeholder="-122.4194"
					value={qrData.data.longitude || ''}
					oninput={handleInput('longitude')}
				/>
			</div>
		</div>
		<div class="space-y-2">
			<Label htmlFor="loc-label">Location Label (Optional)</Label>
			<Input
				id="loc-label"
				placeholder="San Francisco"
				value={qrData.data.label || ''}
				oninput={handleInput('label')}
			/>
		</div>
	</div>
{/if}
