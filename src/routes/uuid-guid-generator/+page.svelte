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
	import { getToolBySlug } from '$lib/shared/config/tools';
	import { UuidGenerator } from './components';

	const currentTool = getToolBySlug('uuid-guid-generator')!;

	// Track bulk generation count for upsell
	let bulkGenerationCount = $state(0);

	function handleBulkGeneration(count: number) {
		bulkGenerationCount = count;
	}

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Generate UUIDs and GUIDs',
			steps: [
				{
					title: 'Select Your UUID Version',
					description:
						'Choose between UUID v1 (time-based), v4 (random), or v7 (time-ordered). For most use cases, v4 is the industry standard for primary keys and unique identifiers in distributed systems.'
				},
				{
					title: 'Configure Advanced Options',
					description:
						'Customize your UUID format with options like uppercase, strip hyphens, add braces (for Windows GUID format), or add URN prefix. You can also add timestamps for sortable identifiers.'
				},
				{
					title: 'Generate Single or Bulk UUIDs',
					description:
						'Click generate for a single UUID, or use the bulk generator to create up to 1000 UUIDs at once. Perfect for seeding test databases or generating multiple unique identifiers.'
				},
				{
					title: 'Copy or Download',
					description:
						'Copy individual UUIDs to your clipboard with one click, or download bulk UUIDs as .txt or .csv files for easy import into your database or application.'
				}
			]
		},
		comparison: {
			title: 'UUID Versions Explained: v1 vs v4 vs v7',
			description:
				'Understanding the differences between UUID versions helps you choose the right identifier for your use case. Each version has specific characteristics that make it suitable for different scenarios.',
			headers: ['Feature', 'UUID v1 (Time-based)', 'UUID v4 (Random)', 'UUID v7 (Time-ordered)'],
			rows: [
				{
					label: 'Generation Method',
					columns: [
						'Timestamp + MAC address + clock sequence',
						'Cryptographically random',
						'Millisecond timestamp + random bits'
					]
				},
				{
					label: 'Sortability',
					columns: [
						'Sortable by time (with caveats)',
						'Not sortable',
						'Fully sortable by creation time'
					]
				},
				{
					label: 'Best For',
					columns: [
						'Legacy systems, audit trails',
						'Primary keys, distributed systems',
						'Database indexes, time-series data'
					]
				},
				{
					label: 'Privacy',
					columns: [
						'Exposes MAC address (privacy concern)',
						'Fully anonymous',
						'Anonymous (no MAC address)'
					]
				},
				{
					label: 'Collision Risk',
					columns: [
						'Very low (time + node)',
						'Extremely low (2^122 possibilities)',
						'Very low (time + random)'
					]
				}
			]
		},
		bestPractices: {
			title: 'When to Use UUIDs vs Auto-Increment Integers',
			practices: [
				'Use UUIDs in distributed systems: When multiple servers generate IDs independently, UUIDs prevent collisions without coordination.',
				'Use integers for single-database systems: Auto-increment integers are faster for indexing and use less storage (4-8 bytes vs 16 bytes).',
				'UUIDs for public-facing IDs: UUIDs hide your record count and prevent enumeration attacks (e.g., /users/1, /users/2).',
				'Consider UUID v7 for time-series data: v7 combines the benefits of UUIDs with natural time-based sorting, improving database index performance.',
				'Avoid UUID v1 for privacy: v1 exposes your MAC address, which can be a security concern. Use v4 or v7 instead.',
				'Use bulk generation for test data: Generate thousands of UUIDs at once to seed test databases or create mock data efficiently.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between UUID and GUID?',
					answer:
						'UUID (Universally Unique Identifier) and GUID (Globally Unique Identifier) are essentially the same thing. GUID is the term Microsoft uses in the .NET ecosystem, while UUID is the standard term defined in RFC 4122. Both refer to 128-bit identifiers.'
				},
				{
					question: 'Which UUID version should I use?',
					answer:
						"For most applications, use UUID v4 (random). It's the industry standard for primary keys and distributed systems. Use v1 only if you need time-based sorting in legacy systems. Use v7 if you need both uniqueness and time-based sorting with better database performance."
				},
				{
					question: 'Are UUIDs truly unique?',
					answer:
						"While not mathematically guaranteed, the probability of UUID collision is astronomically low. UUID v4 has 2^122 possible values (5.3 x 10^36). You'd need to generate 1 billion UUIDs per second for 85 years to have a 50% chance of a single collision."
				},
				{
					question: 'Can I use UUIDs as database primary keys?',
					answer:
						'Yes, but consider the trade-offs. UUIDs work great in distributed systems and prevent enumeration attacks. However, they use more storage (16 bytes vs 4-8 bytes for integers) and can be slower for indexing. UUID v7 addresses some performance concerns with time-based ordering.'
				},
				{
					question: 'Is my data safe when generating UUIDs?',
					answer:
						'Yes! All UUID generation happens entirely in your browser using JavaScript. We never send your UUIDs to our servers, store them in any database, or transmit them over the internet. Your identifiers remain completely private.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'UUID/GUID Generator',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Generate random UUIDs (v4) and time-based UUIDs (v1) instantly. Bulk generation supported. Validate existing GUIDs. Free, client-side, and privacy-focused.',
		featureList: [
			'UUID v1 Generation (Time-based)',
			'UUID v4 Generation (Random)',
			'UUID v7 Generation (Time-ordered)',
			'GUID Generation',
			'Bulk UUID Generation (up to 1000)',
			'UUID Validation',
			'Multiple Format Options',
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

<div class="mx-auto">
	<PageHeader
		title="Free Online UUID & GUID Generator"
		description="Generate random UUIDs (v4), time-based UUIDs (v1), and time-ordered UUIDs (v7). Bulk generation, validation, and multiple format options — all processed in your browser."
	/>
	<TrustStrip />

	<UuidGenerator onBulkGenerate={handleBulkGeneration} />

	<!-- Internal Linking - Fake Data Generator Upsell (when generating 50+ UUIDs) -->
	{#if bulkGenerationCount >= 50}
		<div
			class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
		>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
						🎲 Generating {bulkGenerationCount} UUIDs for test data?
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Need more than just IDs? Generate full user profiles, addresses, emails, and more.
					</p>
				</div>
				<a
					href="https://fake.devxhub.com/"
					target="_blank"
					rel="noopener noreferrer"
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
					Try Fake Data Generator
				</a>
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
			title="Download: UUID vs. Auto-Increment - The Database Scaling Guide"
			description="Learn when to use UUIDs (v1, v4, v7) to prevent database collisions in distributed systems and when integers are better."
			toolName="UUID/GUID Generator"
			hookText="Architects designing scalable systems need to understand the trade-offs. This guide helps you choose the right identifier strategy for your database architecture."
			buttonText="Download Free Guide"
		/>
	</div>

	<!-- Contextual CTA -->
	<div class="mt-10">
		<CTA
			title="Designing a High-Scale Distributed System?"
			description="UUIDs prevent collisions, but they impact indexing speed. Our architects design scalable, high-performance database schemas tailored to your needs."
			buttonText="View Backend Architecture Services"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
