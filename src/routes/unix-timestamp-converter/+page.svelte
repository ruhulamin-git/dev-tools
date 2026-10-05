<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import ConverterForm from './components/ConverterForm.svelte';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use Unix Timestamp Converter',
			steps: [
				{
					title: 'Choose Conversion Direction',
					description:
						'Select whether you want to convert a Unix timestamp to a human-readable date, or convert a date to a Unix timestamp. Both directions are supported with instant conversion.'
				},
				{
					title: 'Enter Your Value',
					description:
						'For timestamp-to-date: Enter the Unix timestamp in seconds (10 digits) or milliseconds (13 digits). For date-to-timestamp: Use the date picker or type the date in your preferred format.'
				},
				{
					title: 'Select Timezone',
					description:
						'Choose between UTC (Coordinated Universal Time) or your local timezone. UTC is the standard for servers and databases, while local time is useful for user-facing displays.'
				},
				{
					title: 'Copy Result',
					description:
						'Click the copy button to copy the converted value to your clipboard. Use it in your code, database queries, or API requests instantly.'
				}
			]
		},
		comparison: {
			title: 'Unix Timestamp Formats: Seconds vs Milliseconds',
			description:
				'Different programming languages and systems use different timestamp formats. Understanding the difference helps you avoid common bugs.',
			headers: ['Format', 'Example', 'Common Usage'],
			rows: [
				{
					label: 'Seconds (10 digits)',
					columns: ['1703088000', 'Unix/Linux systems, PHP, Python time.time()']
				},
				{
					label: 'Milliseconds (13 digits)',
					columns: ['1703088000000', 'JavaScript Date.now(), Java System.currentTimeMillis()']
				},
				{
					label: 'Microseconds (16 digits)',
					columns: ['1703088000000000', 'High-precision timing, Python time.time() * 1000000']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Timestamps',
			practices: [
				'Always store timestamps in UTC: Never store local time in databases. Convert to UTC for storage, then convert to local time for display.',
				'Use seconds for most cases: Unix timestamps in seconds (10 digits) are the standard. Use milliseconds only when you need sub-second precision.',
				'Beware of the Year 2038 Problem: 32-bit systems will overflow on January 19, 2038. Use 64-bit integers or upgrade your systems before then.',
				'Handle timezone conversions carefully: Always specify the timezone when converting. Ambiguous times during DST transitions can cause bugs.',
				'Use ISO 8601 for APIs: When sending dates in JSON APIs, use ISO 8601 format (2024-01-01T00:00:00Z) instead of Unix timestamps for better readability.',
				'Test with edge cases: Test your timestamp handling with dates before 1970, after 2038, during DST transitions, and across different timezones.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the Unix Epoch?',
					answer:
						"The Unix Epoch is January 1, 1970, 00:00:00 UTC. It's the reference point for Unix timestamps—the number of seconds (or milliseconds) that have elapsed since this moment. This standard was chosen when Unix was developed and has been used ever since."
				},
				{
					question: 'What is the Year 2038 Problem?',
					answer:
						"The Year 2038 Problem occurs because 32-bit systems store Unix timestamps as signed integers, which can only represent dates up to January 19, 2038, 03:14:07 UTC. After this, the timestamp overflows and wraps around to December 13, 1901. Modern 64-bit systems don't have this issue and can represent dates billions of years into the future."
				},
				{
					question: 'How do I get the current timestamp in my programming language?',
					answer:
						'JavaScript: Date.now() (milliseconds) or Math.floor(Date.now() / 1000) (seconds). Python: import time; time.time() (seconds). PHP: time() (seconds). SQL: SELECT UNIX_TIMESTAMP() (seconds). Java: System.currentTimeMillis() (milliseconds).'
				},
				{
					question: 'Should I use seconds or milliseconds?',
					answer:
						"Use seconds (10 digits) for most applications—it's the standard Unix timestamp format. Use milliseconds (13 digits) only when you need sub-second precision, such as for performance monitoring, high-frequency trading, or precise event ordering."
				},
				{
					question: 'How do I handle timezones correctly?',
					answer:
						'Always store timestamps in UTC in your database. When displaying to users, convert from UTC to their local timezone. Never store local time directly—it causes issues with DST transitions and makes it impossible to correctly display times for users in different timezones.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Unix Timestamp Converter',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Convert Unix timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, and microseconds. Handle UTC and local timezones instantly.',
		featureList: [
			'Unix Timestamp to Date Conversion',
			'Date to Unix Timestamp Conversion',
			'Seconds Support',
			'Milliseconds Support',
			'Microseconds Support',
			'UTC Timezone',
			'Local Timezone',
			'ISO 8601 Format',
			'Client-Side Processing',
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

<div class="mx-auto">
	<PageHeader
		title="Unix Timestamp to Date Converter"
		description="Convert Unix timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, and microseconds. Handle UTC and local timezones instantly."
	/>

	<ConverterForm />

	<!-- Internal Linking - Ramadan Time App Showcase -->
	<div
		class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
	>
		<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
					🕌 Building a time-sensitive application?
				</h3>
				<p class="text-sm text-blue-700 dark:text-blue-400">
					Check out our Ramadan Time App to see how we handle precise global timing for millions of
					users.
				</p>
			</div>
			<a
				href="https://play.google.com/store/apps/details?id=com.devxhub.muslimtimespro&pcampaignid=web_share"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
					/>
				</svg>
				View Ramadan Time App
			</a>
		</div>
	</div>

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
			title="Download: The 'Timezone Nightmare' Survival Guide"
			description="Handle time zones and timestamps correctly in your applications."
			toolName="Unix Timestamp Converter"
			hookText="Every developer hates timezones. This guide solves the 'it works on my machine but the time is wrong' bug. Learn UTC best practices, DST handling, and timezone conversion strategies."
			buttonText="Download Free Guide"
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Timezone bugs killing your app?"
			description="Handling global scheduling and DST is complex. We build robust systems that keep users in sync worldwide."
			buttonText="Hire Backend Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
