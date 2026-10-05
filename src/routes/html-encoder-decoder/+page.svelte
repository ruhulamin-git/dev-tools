<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import HtmlInput from './components/HtmlInput.svelte';
	import HtmlOutput from './components/HtmlOutput.svelte';
	import type { OperationMode } from './utils/htmlEncoder';
	import { decodeHtml, encodeHtml, hasHtmlEntities } from './utils/htmlEncoder';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Encode and Decode HTML Entities',
			steps: [
				{
					title: 'Paste Your HTML or Text',
					description:
						'Copy and paste HTML code, user input, or text containing special characters into the input field. The tool automatically detects whether you need encoding or decoding.'
				},
				{
					title: 'Choose Encode or Decode',
					description:
						'Select "Encode" to convert special characters (< > & " \') to HTML entities (&lt; &gt; &amp; &quot; &#39;). Select "Decode" to convert HTML entities back to readable characters.'
				},
				{
					title: 'Review the Output',
					description:
						'The converted text appears instantly in the output panel. Encoded text is safe to display in HTML without executing scripts. Decoded text is human-readable.'
				},
				{
					title: 'Copy and Use',
					description:
						'Click the copy button to copy the result to your clipboard. Use encoded text in your HTML, database, or API responses to prevent XSS attacks and display special characters correctly.'
				}
			]
		},
		comparison: {
			title: 'Common HTML Entities Reference',
			description:
				'These are the most frequently used HTML entities for escaping special characters in web development.',
			headers: ['Character', 'HTML Entity', 'Description'],
			rows: [
				{
					label: '&',
					columns: ['&amp;', 'Ampersand - Must be encoded first']
				},
				{
					label: '<',
					columns: ['&lt;', 'Less than - Prevents tag interpretation']
				},
				{
					label: '>',
					columns: ['&gt;', 'Greater than - Closes tags safely']
				},
				{
					label: '"',
					columns: ['&quot;', 'Double quote - Safe in attributes']
				},
				{
					label: "'",
					columns: ['&#39; or &apos;', 'Single quote - Safe in attributes']
				},
				{
					label: 'Space',
					columns: ['&nbsp;', 'Non-breaking space']
				}
			]
		},
		bestPractices: {
			title: 'Why Encode HTML? (Prevent XSS Attacks)',
			practices: [
				'Prevent Cross-Site Scripting (XSS): If users can submit malicious scripts, they can execute harmful code. Encoding converts tags to safe entities that display as text instead of executing.',
				'Sanitize User Input: Always encode user-generated content before displaying it in HTML. This includes comments, forum posts, profile bios, and search queries.',
				'Protect Form Submissions: Encode data from forms before storing in databases or displaying on pages. Attackers often inject scripts through input fields.',
				'Secure API Responses: When returning user data via APIs, encode HTML entities to prevent XSS when the data is rendered in browsers.',
				'Display Special Characters: Use HTML entities to display reserved characters like angle brackets, ampersands, and quotes without breaking HTML structure.',
				'Defense in Depth: HTML encoding is one layer of security. Also use Content Security Policy (CSP), input validation, and parameterized queries for complete protection.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is HTML encoding and why is it important?',
					answer:
						"HTML encoding converts special characters into HTML entities. This is critical for security because it prevents Cross-Site Scripting (XSS) attacks. Without encoding, malicious users can inject script tags that execute harmful code in other users' browsers."
				},
				{
					question: 'What is the difference between encoding and escaping?',
					answer:
						'HTML encoding and HTML escaping are the same thing—both convert special characters to HTML entities. The terms are used interchangeably. Sanitizing is a broader term that includes encoding plus other security measures like input validation and filtering.'
				},
				{
					question: 'When should I encode HTML entities?',
					answer:
						'Always encode HTML entities when displaying user-generated content: comments, forum posts, profile information, search results, or any data from untrusted sources. Encode before storing in databases or before rendering in HTML to prevent XSS attacks.'
				},
				{
					question: 'What are the "Big 5" HTML entities I must encode?',
					answer:
						'The five most critical characters to encode are: ampersand, less than, greater than, double quote, and single quote. These prevent tag injection and attribute breaking in HTML.'
				},
				{
					question: 'Is HTML encoding enough to prevent XSS attacks?',
					answer:
						'HTML encoding is essential but not sufficient alone. Use multiple layers: 1) Encode output (HTML entities), 2) Validate input (whitelist allowed characters), 3) Use Content Security Policy (CSP) headers, 4) Use parameterized queries for databases, 5) Keep frameworks and libraries updated.'
				}
			]
		}
	};

	let inputText = $state('');
	let outputText = $state('');
	let mode = $state<OperationMode>('encode');
	let autoDetect = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Detect if user is decoding large HTML content
	const isDecodingLargeHtml = $derived(
		mode === 'decode' && inputText.length > 500 && hasHtmlEntities(inputText)
	);

	const sampleText =
		'<div class="container">\n  <h1>Hello & Welcome!</h1>\n  <p>This is a "sample" text with <special> characters.</p>\n</div>';

	const processInput = () => {
		if (!inputText.trim()) {
			outputText = '';
			return;
		}

		if (autoDetect) {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const shouldDecode = hasHtmlEntities(inputText);
				if (shouldDecode && mode !== 'decode') mode = 'decode';
				else if (!shouldDecode && mode !== 'encode') mode = 'encode';
			}, 300);
		}

		outputText = mode === 'encode' ? encodeHtml(inputText) : decodeHtml(inputText);
	};

	$effect(() => {
		inputText;
		mode;
		processInput();
	});

	const handleInputChange = (text: string) => {
		inputText = text;
	};
	const handleModeChange = (newMode: OperationMode) => {
		mode = newMode;
		autoDetect = false;
	};
	const handleAutoDetectChange = (enabled: boolean) => {
		autoDetect = enabled;
	};

	const handleSwap = () => {
		const temp = inputText;
		inputText = outputText;
		outputText = temp;
		mode = mode === 'encode' ? 'decode' : 'encode';
	};

	const handleReset = () => {
		inputText = '';
		outputText = '';
		mode = 'encode';
		autoDetect = false;
	};

	const handleLoadSample = () => {
		inputText = sampleText;
		mode = 'encode';
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'HTML Entity Encoder & Decoder',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Convert special characters to HTML entities (e.g., < to &lt;) to prevent XSS attacks. Decode HTML entities back to text. Secure client-side processing.',
		featureList: [
			'HTML Encoding',
			'HTML Decoding',
			'Entity Conversion',
			'XSS Prevention',
			'Special Character Escape',
			'Auto-Detection',
			'Batch Processing',
			'Copy to Clipboard',
			'Client-Side Processing',
			'Privacy Focused',
			'Free to Use'
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
		title="HTML Entity Encoder and Decoder"
		description="Convert special characters to HTML entities to prevent XSS attacks. Encode angle brackets, ampersands, and quotes or decode back to readable text—all processing happens in your browser."
	/>

	<div class="space-y-4 sm:space-y-6">
		<HtmlInput
			{inputText}
			{mode}
			{autoDetect}
			onInputChange={handleInputChange}
			onModeChange={handleModeChange}
			onAutoDetectChange={handleAutoDetectChange}
			onSwap={handleSwap}
			onReset={handleReset}
			onLoadSample={handleLoadSample}
		/>

		<HtmlOutput {outputText} {mode} />

		<!-- Conditional Upsell: Markdown Editor for Large HTML -->
		{#if isDecodingLargeHtml}
			<div
				class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
			>
				<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
					<div class="flex flex-1 items-start gap-3">
						<svg
							class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						<div class="flex-1">
							<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
								📝 Need to edit this content properly?
							</h3>
							<p class="text-sm text-blue-700 dark:text-blue-400">
								Switch to our Markdown Editor for a better writing experience with live preview and
								formatting tools.
							</p>
						</div>
					</div>
					<a
						href="https://www.devxhub.com/tools/online-markdown-editor"
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						Try Markdown Editor
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</a>
				</div>
			</div>
		{/if}
	</div>

	<!-- SEO Content Section -->
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
			title="Download: XSS Prevention 101 - Sanitizing User Input Guide"
			description="Complete guide to preventing Cross-Site Scripting attacks in web applications."
			toolName="HTML Encoder & Decoder"
			hookText="Learn how to prevent hackers from injecting malicious scripts into your site. Covers HTML encoding, input validation, Content Security Policy, and defense-in-depth strategies. Essential for all web developers."
			buttonText="Download Free Guide"
		/>
	</div>

	<!-- Conversion CTA -->
	<div class="mt-10">
		<CTA
			title="Worried About XSS Vulnerabilities?"
			description="Sanitizing input is just step one. Our security engineers audit and patch vulnerabilities in enterprise applications. Get a comprehensive penetration test."
			buttonText="View Security Services"
			buttonUrl="https://www.devxhub.com/custom-software-development"
		/>
	</div>
</div>
