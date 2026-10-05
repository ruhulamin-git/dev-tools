<script lang="ts">
	import {
		CTA,
		JsonLd,
		LeadMagnetInline,
		PageHeader,
		RelatedTools,
		SeoContent,
		TrustStrip
	} from '$lib/shared/components';
	import { Select } from '$lib/shared/components/ui';
	import { Card, CardContent, CardHeader } from '$lib/shared/components/ui/card';
	import { getToolBySlug } from '$lib/shared/config/tools';
	import { onDestroy, onMount } from 'svelte';
	import { QRCodeCustomizer, QRCodeForm, QRCodePreview } from './components';
	import type { QRCodeOptions } from './types';
	import * as utils from './utils';

	const currentTool = getToolBySlug('qr-code-generator')!;

	let selectedType = $state('url');
	let qrCodeUrl = $state('');
	let qrContent = $state('');
	let isGenerating = $state(false);
	let error = $state('');
	let hasUserInteracted = $state(false);

	let qrSize = $state(400);
	let foregroundColor = $state('#000000');
	let backgroundColor = $state('#ffffff');
	let errorCorrection = $state<'L' | 'M' | 'Q' | 'H'>('M');

	let formData = $state(utils.createEmptyFormData());

	// Debounce timer for instant but optimized generation
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Educational content data
	const seoData = {
		howToSteps: {
			steps: [
				{
					title: 'Choose Type',
					description:
						'Select the type of QR code you need: URL (website link), Text (plain text message), WiFi (network credentials), vCard (contact information), Email, Phone, or SMS.'
				},
				{
					title: 'Enter Content',
					description:
						'Fill in the required information based on your selected type. For URLs, paste your website link. For WiFi, enter your network name and password. For vCards, add contact details like name, phone, and email.'
				},
				{
					title: 'Customize Style',
					description:
						'Personalize your QR code by adjusting the size (200-800px), choosing foreground and background colors for brand consistency, and selecting an error correction level (L, M, Q, or H) based on your printing needs.'
				},
				{
					title: 'Download',
					description:
						'Click the download button to save your QR code as a high-resolution PNG image. Your QR code is ready to use immediately - print it on marketing materials, add it to business cards, or share it digitally.'
				}
			]
		},
		comparison: {
			title: "Static vs. Dynamic QR Codes: What's the Difference?",
			description:
				'Our free tool creates Static QR codes, which are permanent and encode data directly into the QR pattern. The content cannot be changed after generation, but they work forever without requiring any server or subscription. For Dynamic QR codes that allow tracking, analytics, and content updates, contact us for a custom enterprise solution.',
			headers: ['Feature', 'Static QR Codes', 'Dynamic QR Codes'],
			rows: [
				{
					label: 'Data Storage',
					columns: ['Encoded directly in the QR pattern', 'Stored on a server with a redirect URL']
				},
				{
					label: 'Editability',
					columns: ['Cannot be changed after creation', 'Content can be updated anytime']
				},
				{
					label: 'Tracking & Analytics',
					columns: ['No tracking capabilities', 'Scan tracking, location data, device info']
				},
				{
					label: 'Cost',
					columns: ['100% free forever', 'Requires subscription or custom solution']
				},
				{
					label: 'Best For',
					columns: [
						'Permanent links, WiFi passwords, business cards',
						'Marketing campaigns, A/B testing, time-sensitive content'
					]
				}
			]
		},
		bestPractices: {
			practices: [
				'Ensure high contrast: Use dark colors on light backgrounds (black on white is ideal). Avoid low-contrast combinations like yellow on white or dark blue on black.',
				'Maintain minimum size: Print QR codes at least 2cm x 2cm (0.8 x 0.8 inches) for reliable scanning. Larger is better for distant scanning or outdoor use.',
				'Choose appropriate error correction: Use Level L (7%) for digital displays, Level M (15%) for most prints, Level Q (25%) for curved surfaces, and Level H (30%) for damaged or dirty environments.',
				'Test before mass printing: Always scan your QR code with multiple devices and apps before printing thousands of copies.',
				'Leave quiet zone space: Maintain a clear border (at least 4 modules wide) around the QR code without any text or graphics.',
				'Avoid distortion: Never stretch or compress QR codes. Always maintain the square aspect ratio to ensure scannability.'
			]
		},
		faqs: {
			items: [
				{
					question: 'Do these QR codes expire?',
					answer:
						'No, our static QR codes are 100% free and never expire. Once generated, they work permanently without any time limits or scan restrictions.'
				},
				{
					question: 'Can I use this for commercial purposes?',
					answer:
						'Yes, absolutely. You can use these QR codes for any commercial purpose including marketing materials, product packaging, business cards, and advertising campaigns.'
				}
			]
		}
	};

	onMount(() => {
		// Preload QR library in background for instant generation
		// This ensures the first QR code generation is fast with no lag
		import('./utils/qr-browser').then((module) => {
			module.preloadQRCode();
		});
	});

	onDestroy(() => {
		// Cleanup debounce timer on component unmount
		if (debounceTimer) clearTimeout(debounceTimer);
	});

	function markUserInteraction() {
		hasUserInteracted = true;
	}

	function scheduleGeneration() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			generateQrCode();
		}, 150);
	}

	function handleFormDataChange(newData: Record<string, string>) {
		markUserInteraction();
		formData = utils.updateFormDataByType(selectedType, formData, newData);
		scheduleGeneration();
	}

	async function generateQrCode(): Promise<void> {
		if (!hasUserInteracted) return;

		const qrData = utils.formDataToQRCodeData(selectedType, formData);
		const data = utils.generateQRContent(qrData);

		if (!data.trim()) {
			qrCodeUrl = '';
			qrContent = '';
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

			const url = await utils.generateQRCodeImage(qrData, options);
			qrCodeUrl = url;
			qrContent = data;
		} catch (err) {
			error = 'Failed to generate QR code. Please check your input.';
			qrCodeUrl = '';
			qrContent = '';
		} finally {
			isGenerating = false;
		}
	}

	function handleOptionsChange(options: QRCodeOptions) {
		qrSize = options.size;
		foregroundColor = options.foregroundColor;
		backgroundColor = options.backgroundColor;
		errorCorrection = options.errorCorrection;
		markUserInteraction();
		scheduleGeneration();
	}

	function handleTypeChange(val: any): void {
		const value = val?.target?.value ?? val;
		selectedType = value;
		formData = utils.createEmptyFormData();
		error = '';
		qrCodeUrl = '';
		qrContent = '';
		hasUserInteracted = false;
	}

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Free QR Code Generator',
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Generate free, permanent QR codes for URLs, WiFi, vCards, and more. High-resolution download with customizable colors and no scan limits.',
		featureList: [
			'URL QR Codes',
			'WiFi QR Codes',
			'vCard Contact QR Codes',
			'Email QR Codes',
			'SMS QR Codes',
			'Phone QR Codes',
			'Custom Colors',
			'High Resolution Export',
			'No Expiration',
			'No Sign-up Required'
		],
		screenshot: 'https://www.devxhub.com/preview.png',
		softwareVersion: '1.0',
		author: {
			'@type': 'Organization',
			name: 'Devxhub',
			url: 'https://www.devxhub.com'
		}
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<!-- SEO handled by /tools/+layout.svelte -->

<div class="mx-auto">
	<PageHeader
		title="Free QR Code Generator"
		description=" Generate free, permanent QR codes for URLs, WiFi, and vCards. High-resolution download with no scan limits. Customizable colors and logos. Privacy-focused"
	/>
	<TrustStrip />

	{#if !formData}
		<div class="flex min-h-[400px] items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
			></div>
		</div>
	{:else}
		<div class="grid gap-8 lg:grid-cols-2">
			<div class="space-y-6">
				<Card>
					<CardHeader>
						<h2 class="text-2xl leading-none font-semibold tracking-tight text-slate-900">
							QR Code Type
						</h2>
					</CardHeader>
					<CardContent>
						<Select
							id="qr-type-select"
							bind:value={selectedType}
							onchange={handleTypeChange}
							ariaLabel="Select QR code type"
							options={utils.QR_TYPES}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h2 class="text-2xl leading-none font-semibold tracking-tight text-slate-900">
							Enter Details
						</h2>
					</CardHeader>
					<CardContent>
						<QRCodeForm
							{selectedType}
							qrData={utils.getFormDataForComponent(
								selectedType,
								formData,
								utils.formDataToQRCodeData
							)}
							onDataChange={handleFormDataChange}
						/>
						{#if error}
							<div class="mt-2 text-sm text-red-500" role="alert" aria-live="polite">
								{error}
							</div>
						{/if}
					</CardContent>
				</Card>

				<QRCodeCustomizer
					options={{
						size: qrSize,
						foregroundColor,
						backgroundColor,
						errorCorrection
					}}
					onUpdate={handleOptionsChange}
				/>
			</div>

			<div class="space-y-6">
				<QRCodePreview
					{qrCodeUrl}
					{isGenerating}
					{error}
					{selectedType}
					{qrContent}
					qrOptions={{
						size: qrSize,
						foregroundColor,
						backgroundColor,
						errorCorrection
					}}
					typeLabel={utils.QR_TYPES.find((t: any) => t.value === selectedType)?.label || ''}
				/>
			</div>
		</div>
	{/if}

	<RelatedTools tool={currentTool} />

	<div class="mt-10">
		<SeoContent
			howToSteps={seoData.howToSteps}
			comparison={seoData.comparison}
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
		/>
	</div>
	<!-- Lead Magnet -->
	<div class="mt-10">
		<LeadMagnetInline
			title="Download: 10 Smart QR Marketing Ideas for Retail & Events"
			description="Get practical QR code marketing strategies for your business."
			toolName="QR Code Generator"
			hookText="Learn how to use QR codes for inventory tracking, event ticketing, contactless payments, and customer engagement campaigns."
			buttonText="Download Free PDF Guide"
		/>
	</div>
	<!-- Contextual CTA - Right after Download button area -->
	<div class="mt-10">
		<CTA
			title="Building a mobile app with QR scanning?"
			description="Standard camera apps are slow. Hire Devxhub to build high-performance inventory or ticketing systems with custom SDKs."
			buttonText="View Mobile Dev Services"
			buttonUrl="https://www.devxhub.com/mobile-application-development"
		/>
	</div>
</div>
