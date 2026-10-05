<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import UrlEncoderBody from './components/UrlEncoderBody.svelte';

	// Track if JSON is detected in decoded URL
	let hasJsonInUrl = $state(false);

	function handleJsonDetection(detected: boolean) {
		hasJsonInUrl = detected;
	}

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Encode and Decode URLs',
			steps: [
				{
					title: 'Choose Operation',
					description:
						'Select whether you want to encode (convert special characters to percent-encoded format) or decode (convert percent-encoded characters back to readable text). The tool auto-detects encoded URLs for convenience.'
				},
				{
					title: 'Enter Your URL',
					description:
						'Paste your URL or query string into the input field. For encoding, enter the raw URL with special characters. For decoding, paste the percent-encoded URL (with %20, %3A, etc.).'
				},
				{
					title: 'Process Instantly',
					description:
						'The tool processes your URL instantly as you type. No need to click a button—encoding and decoding happen in real-time in your browser.'
				},
				{
					title: 'Copy Result',
					description:
						'Click the copy button to copy the encoded or decoded URL to your clipboard. Use it in your API requests, HTML links, or JavaScript code immediately.'
				}
			]
		},
		comparison: {
			title: 'Common Encoded Characters Reference',
			description:
				"URLs can only contain ASCII characters. Special characters must be percent-encoded. Here are the most common encodings you'll encounter.",
			headers: ['Character', 'Encoded', 'Usage'],
			rows: [
				{
					label: 'Space',
					columns: ['%20 or +', 'Separating words in query parameters']
				},
				{
					label: '! (Exclamation)',
					columns: ['%21', 'Special character in URLs']
				},
				{
					label: '# (Hash)',
					columns: ['%23', 'Fragment identifier (anchor links)']
				},
				{
					label: '& (Ampersand)',
					columns: ['%26', 'Separating query parameters']
				},
				{
					label: '= (Equals)',
					columns: ['%3D', 'Key-value separator in query strings']
				},
				{
					label: '? (Question)',
					columns: ['%3F', 'Query string delimiter']
				}
			]
		},
		bestPractices: {
			title: 'URL Encoding Best Practices',
			practices: [
				'Only encode query parameters: Never encode the entire URL. Only encode the values in query parameters (after ? and &). The protocol (https://), domain, and path should remain unencoded.',
				'Use UTF-8 encoding: Always use UTF-8 for encoding special characters and emojis. This is the standard for modern web applications.',
				'Encode user input: Always encode user-provided data before adding it to URLs. This prevents injection attacks and broken links.',
				'Double encoding is dangerous: Avoid encoding already-encoded URLs. This creates double-encoded strings (%2520 instead of %20) that break your application.',
				"Use encodeURIComponent in JavaScript: Use encodeURIComponent() for query parameter values, not encodeURI(). encodeURI() doesn't encode characters like & and = which break query strings.",
				'Test with special characters: Always test your URL encoding with spaces, emojis, non-English characters, and symbols to ensure proper handling.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is URL Encoding (Percent-Encoding)?',
					answer:
						'URL encoding (also called percent-encoding) is the process of converting special characters into a format that can be transmitted over the internet. URLs can only contain ASCII characters, so "unsafe" characters like spaces, emojis, or symbols (&, ?, /) must be converted to a % followed by two hexadecimal digits representing the character\'s UTF-8 code.'
				},
				{
					question: 'When should I encode a URL?',
					answer:
						'Encode URLs when: 1) Adding user input to query parameters, 2) Including special characters in URL paths or parameters, 3) Sending URLs in API requests, 4) Creating shareable links with dynamic content. Do NOT encode the entire URL—only encode the query parameter values and path segments that contain special characters.'
				},
				{
					question:
						"What's the difference between encoding the entire URL and just query parameters?",
					answer:
						'Encoding the entire URL is wrong—it will break the protocol (https://) and domain. Only encode the VALUES in query parameters. For example, in "https://example.com/search?q=hello world", only encode "hello world" to "hello%20world", not the entire URL.'
				},
				{
					question: 'Why does my URL have %20 instead of spaces?',
					answer:
						'Spaces are not allowed in URLs, so they must be encoded. %20 is the percent-encoded representation of a space character. Some systems use + instead of %20 for spaces in query parameters, but %20 is the standard and works everywhere.'
				},
				{
					question: 'How do I encode URLs in my programming language?',
					answer:
						'JavaScript: encodeURIComponent(value) for query parameters. Python: urllib.parse.quote(value). PHP: urlencode($value). Java: URLEncoder.encode(value, "UTF-8"). Always use the function designed for query parameters, not the one for entire URLs.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'URL Encoder & Decoder',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Encode and decode URLs instantly. Convert special characters to UTF-8 percent-encoded format. Fix broken query parameters and clean up messy links.',
		featureList: [
			'URL Encoding',
			'URL Decoding',
			'Percent-Encoding',
			'UTF-8 Support',
			'Query String Handling',
			'Special Character Conversion',
			'Auto-Detection',
			'Client-Side Processing',
			'Copy & Download Support',
			'Real-Time Conversion'
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
		title="Online URL Encoder and Decoder"
		description="Encode and decode URLs instantly. Convert special characters to UTF-8 percent-encoded format. Fix broken query parameters and clean up messy links."
	/>

	<UrlEncoderBody onJsonDetected={handleJsonDetection} />

	<!-- Internal Linking - JSON Formatter Upsell (when JSON detected in decoded URL) -->
	{#if hasJsonInUrl}
		<div
			class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
		>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
						📋 Found JSON data in this URL?
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Beautify it with our JSON Formatter for better readability and validation.
					</p>
				</div>
				<a
					href="https://www.devxhub.com/tools/json-formatter-validator"
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
					Format JSON
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

	<div class="mt-10">
		<LeadMagnetInline
			title="Download: SEO-Friendly URLs - A Technical Guide"
			description="Ensure your links work everywhere, every time with proper URL encoding and structure."
			toolName="URL Encoder / Decoder"
			hookText="Fixes broken links and 404 errors caused by special characters in URLs. Learn URL structure, encoding best practices, and SEO-friendly URL patterns."
			buttonText="Download Free Guide"
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Routing logic getting messy?"
			description="Handling complex state in URLs is tricky. Our full-stack developers build clean, RESTful architectures."
			buttonText="Hire Full Stack Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
