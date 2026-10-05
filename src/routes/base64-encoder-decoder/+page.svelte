<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import Base64Input from './components/Base64Input.svelte';
	import Base64Output from './components/Base64Output.svelte';
	import type {
		InputMode,
		OperationMode,
		Base64Options as Options,
		ProcessingResult
	} from './utils/base64Encoder';
	import {
		decodeFile,
		decodeText,
		detectBase64,
		encodeFile,
		encodeText,
		readFileAsArrayBuffer,
		readFileAsText
	} from './utils/base64Encoder';

	let inputMode = $state<InputMode>('text');
	let operationMode = $state<OperationMode>('encode');
	let options = $state<Options>({ urlSafe: false, removePadding: false });
	let textInput = $state('');
	let selectedFile = $state<File | null>(null);
	let result = $state<ProcessingResult | null>(null);
	let autoDetected = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let isImageMode = $derived(inputMode === 'image');
	let isDecodingToken = $derived(
		operationMode === 'decode' &&
			textInput.trim() &&
			textInput.split('.').length === 3 &&
			!textInput.includes(' ')
	);

	const sampleText = 'Hello, World! This is a sample text for Base64 encoding.';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use Base64 Encoder & Decoder',
			steps: [
				{
					title: 'Select Mode',
					description:
						'Choose between Text, Image, or File mode. For text encoding/decoding, use Text mode. For converting images to Data URLs, use Image mode. For other file types, use File mode.'
				},
				{
					title: 'Choose Operation',
					description:
						'Select Encode to convert your data to Base64 format, or Decode to convert Base64 strings back to their original format. The tool auto-detects Base64 input for convenience.'
				},
				{
					title: 'Enter or Upload Data',
					description:
						'For text mode, paste your text or Base64 string. For image/file mode, click to upload or drag and drop your file. The tool processes everything instantly in your browser.'
				},
				{
					title: 'Copy or Download',
					description:
						'Copy the encoded/decoded result to your clipboard with one click, or download it as a file. For images, you can download the decoded result directly.'
				}
			]
		},
		comparison: {
			title: 'Base64 vs. Other Encoding Methods',
			description:
				'Base64 is one of several encoding methods used in web development. Understanding when to use Base64 versus other approaches helps optimize your applications.',
			headers: ['Method', 'Use Case', 'Pros & Cons'],
			rows: [
				{
					label: 'Base64 Encoding',
					columns: [
						'Embedding small images in HTML/CSS, API data transfer',
						'Pros: No HTTP requests, works in text-only contexts. Cons: 33% size increase, not encryption'
					]
				},
				{
					label: 'URL Encoding',
					columns: [
						'Query parameters, form data',
						'Pros: Safe for URLs, preserves special characters. Cons: Only for text, not for binary data'
					]
				},
				{
					label: 'Hex Encoding',
					columns: [
						'Color codes, cryptographic hashes',
						'Pros: Human-readable, simple. Cons: 100% size increase, less efficient than Base64'
					]
				},
				{
					label: 'CDN/External Files',
					columns: [
						'Large images, videos, assets',
						'Pros: Cacheable, parallel downloads. Cons: Requires HTTP request, external dependency'
					]
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Base64 Usage',
			practices: [
				'Use Base64 for small images only (&lt; 10KB): Larger images should be served from a CDN to avoid bloating your HTML/CSS files.',
				'Never use Base64 for sensitive data: Base64 is NOT encryption. Anyone can decode it. Use proper encryption (AES, RSA) for secrets.',
				'Consider URL-safe Base64 for URLs: Use the URL-safe variant (replaces + with - and / with _) when embedding Base64 in URLs or filenames.',
				'Optimize for performance: Base64 increases file size by ~33%. For production, use image optimization tools and CDNs for better performance.',
				'Use Data URLs for icons and small graphics: Embedding small icons as Data URLs reduces HTTP requests and speeds up initial page load.',
				'Avoid Base64 for large files: For files over 100KB, use traditional file uploads or cloud storage services instead of Base64 encoding.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is Base64 encoding?',
					answer:
						"Base64 is a binary-to-text encoding scheme that converts binary data (like images or files) into ASCII text format. It's commonly used to send binary data over media designed to handle text, such as email, HTML, or JSON APIs."
				},
				{
					question: 'Is Base64 secure? Can I use it to hide passwords?',
					answer:
						"No! Base64 is NOT encryption or security. It's simply an encoding format that can be easily decoded by anyone. Never use Base64 to hide passwords, API keys, or sensitive data. Use proper encryption methods like AES or RSA instead."
				},
				{
					question: 'Why do Base64 strings end with = signs?',
					answer:
						'The = signs are padding characters added to make the Base64 string length a multiple of 4. Padding ensures proper decoding. Some implementations allow removing padding (URL-safe Base64), but standard Base64 includes it.'
				},
				{
					question: 'How do I convert images to Base64 for HTML/CSS?',
					answer:
						'Use our Image mode to upload your image file. The tool will generate a Data URL (data:image/png;base64,...) that you can embed directly in HTML img tags or CSS background-image properties. This eliminates HTTP requests for small icons.'
				},
				{
					question: 'Is my data safe when using this tool?',
					answer:
						"Yes! All encoding and decoding happens entirely in your browser using JavaScript. Your data never leaves your device—it's not sent to our servers, stored in any database, or transmitted over the internet. Your privacy is guaranteed."
				}
			]
		}
	};

	const handleTextChange = (text: string) => {
		textInput = text;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => processTextInput(text), 150);
	};

	const processTextInput = (text: string) => {
		if (!text.trim()) {
			result = null;
			autoDetected = false;
			return;
		}
		if (operationMode === 'encode' && detectBase64(text)) {
			operationMode = 'decode';
			autoDetected = true;
			result = decodeText(text, options);
			return;
		}
		autoDetected = false;
		result = operationMode === 'encode' ? encodeText(text, options) : decodeText(text, options);
	};

	const handleFileSelect = async (file: File) => {
		selectedFile = file;
		try {
			if (operationMode === 'encode') {
				const data = await readFileAsArrayBuffer(file);
				const mimeType =
					inputMode === 'image'
						? file.type || 'image/png'
						: file.type || 'application/octet-stream';
				result = encodeFile(data, mimeType, options);
			} else {
				const content = await readFileAsText(file);
				result = decodeFile(content);
			}
		} catch (error) {
			result = {
				success: false,
				output: '',
				error: error instanceof Error ? error.message : 'Processing failed'
			};
		}
	};

	const handleInputModeChange = (mode: InputMode) => {
		inputMode = mode;
		textInput = '';
		selectedFile = null;
		result = null;
		autoDetected = false;
	};

	const handleOperationModeChange = (mode: OperationMode) => {
		operationMode = mode;
		autoDetected = false;
		if (inputMode === 'text' && textInput.trim()) {
			const newResult =
				mode === 'encode' ? encodeText(textInput, options) : decodeText(textInput, options);
			result = newResult;
		} else if (selectedFile) handleFileSelect(selectedFile);
	};

	const handleOptionsChange = (newOptions: Options) => {
		options = newOptions;
		if (inputMode === 'text' && textInput.trim()) {
			result =
				operationMode === 'encode'
					? encodeText(textInput, newOptions)
					: decodeText(textInput, newOptions);
		} else if (selectedFile) handleFileSelect(selectedFile);
	};

	const handleLoadSample = () => {
		textInput = sampleText;
		processTextInput(sampleText);
	};

	const handleReset = () => {
		if (debounceTimer) clearTimeout(debounceTimer);
		textInput = '';
		selectedFile = null;
		result = null;
		operationMode = 'encode';
		inputMode = 'text';
		options = { urlSafe: false, removePadding: false };
		autoDetected = false;
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Base64 Encoder & Decoder',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Encode and decode Base64 strings instantly. Convert images to Base64 for HTML/CSS embedding. Secure client-side processing—your data never leaves your browser.',
		featureList: [
			'Text to Base64 Encoding',
			'Base64 to Text Decoding',
			'Image to Base64 Conversion',
			'File to Base64 Encoding',
			'Data URL Generation',
			'URL-Safe Base64',
			'Auto-Detection',
			'Client-Side Processing',
			'No Data Storage',
			'Copy & Download Support'
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

<article class="mx-auto space-y-6">
	<PageHeader
		title="Base64 Encoder and Decoder"
		description="Encode and decode Base64 for text, images, and files instantly. Convert images to Data URLs for HTML/CSS embedding. All processing happens in your browser—your data never leaves your device."
	/>

	<section
		aria-label="Base64 encoder and decoder interface"
		class="grid h-full gap-6 lg:grid-cols-2"
	>
		<Base64Input
			{inputMode}
			{operationMode}
			{options}
			{textInput}
			{selectedFile}
			{autoDetected}
			onTextChange={handleTextChange}
			onFileSelect={handleFileSelect}
			onInputModeChange={handleInputModeChange}
			onOperationModeChange={handleOperationModeChange}
			onOptionsChange={handleOptionsChange}
			onReset={handleReset}
			{sampleText}
			onLoadSample={handleLoadSample}
		/>

		<Base64Output {result} />
	</section>

	<!-- Internal Linking - JWT Decoder Upsell (when decoding JWT-like tokens) -->
	{#if isDecodingToken}
		<div
			class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
		>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
						🔐 Looks like a JWT token!
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Use our specialized JWT Decoder to view the header, payload, and verify signatures.
					</p>
				</div>
				<a
					href="https://www.devxhub.com/tools/jwt-decoder"
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
					Decode JWT Token
				</a>
			</div>
		</div>
	{/if}

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
			title="Download: The Developer's Guide to Safe Data Transmission"
			description="Master Base64 encoding techniques, security best practices, and performance optimization strategies."
			toolName="Base64 Encoder & Decoder"
			hookText="Learn when to use Base64, how to prevent data corruption in APIs, and the difference between encoding and encryption. Essential reading for backend and frontend developers."
			buttonText="Download Free Guide"
		/>
	</div>
	<div class="mt-10">
		<CTA
			title="Struggling with website performance?"
			description="Base64 strings bloat your DOM. Our frontend experts know when to use Data URLs vs. CDNs for lightning-fast React/Next.js apps."
			buttonText="Hire Frontend Experts"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</article>
