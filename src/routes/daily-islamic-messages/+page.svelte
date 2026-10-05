<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { Button, Card, Select, Tooltip } from '$lib/shared/components/ui';
	import { Check, Copy } from '$lib/shared/icons';
	import { toast } from '$lib/shared/stores/toastStore';
	import { fade } from 'svelte/transition';
	import HadithCarousel from './components/HadithCarousel.svelte';
	import hadiths from './data/hadith.json';
	import messages from './data/messages.json';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use Daily Islamic Messages',
			steps: [
				{
					title: 'Choose Your Language',
					description:
						'Select from Arabic, English, or Bangla using the language selector. All messages and Hadith are available in multiple languages to reach diverse communities.'
				},
				{
					title: 'Browse Messages and Hadith',
					description:
						'Explore daily Islamic greetings, Quranic verses, and authentic Hadith. The carousel automatically rotates through different Hadith, or you can navigate manually.'
				},
				{
					title: 'Copy and Share',
					description:
						'Click the copy button next to any message to copy it to your clipboard. Share on WhatsApp, Facebook, Instagram, or any social media platform to spread Islamic knowledge.'
				},
				{
					title: 'Download for Social Media',
					description:
						"Save messages as images for social media sharing. Perfect for daily reminders, Ramadan posts, or community engagement on your Islamic organization's social channels."
				}
			]
		},
		comparison: {
			title: 'Why Share Islamic Messages Daily?',
			description:
				'Understanding the importance of Dawah (sharing Islamic knowledge) and its impact on the community.',
			headers: ['Benefit', 'Impact', 'Best Practice'],
			rows: [
				{
					label: 'Spiritual Reminder',
					columns: ['Keeps faith strong throughout the day', 'Share in morning for maximum reach']
				},
				{
					label: 'Community Building',
					columns: ['Connects Muslims worldwide', 'Use group chats and community forums']
				},
				{
					label: 'Dawah (Invitation)',
					columns: ['Introduces Islam to non-Muslims', 'Share authentic sources with context']
				},
				{
					label: 'Knowledge Sharing',
					columns: ['Educates about Hadith and Quran', 'Include references (Sahih Bukhari, etc.)']
				},
				{
					label: 'Social Media Presence',
					columns: ['Positive Islamic content online', 'Post consistently during Ramadan']
				}
			]
		},
		bestPractices: {
			title: 'The Importance of Dawah (Sharing Islamic Knowledge)',
			practices: [
				'Share authentic sources: Always verify Hadith authenticity (Sahih Bukhari, Sahih Muslim) before sharing to avoid spreading weak or fabricated narrations.',
				'Include context: When sharing Quranic verses or Hadith, provide brief context to help readers understand the message correctly.',
				'Be consistent: Share daily messages during Ramadan, Fridays (Jummah), or Islamic holidays to build a habit of remembrance.',
				'Use multiple languages: Reach diverse communities by sharing in Arabic, English, and local languages like Bangla, Urdu, or Turkish.',
				'Respect copyright: Use free resources like this tool. Avoid copying from paid Islamic apps or books without permission.',
				'Engage respectfully: When sharing on social media, respond to questions with kindness and direct people to scholars for complex issues.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'Are these Hadith authentic?',
					answer:
						'Yes! All Hadith in our collection are from authentic sources including Sahih Bukhari, Sahih Muslim, and other reliable collections. We verify each Hadith before adding it to ensure accuracy and authenticity.'
				},
				{
					question: 'Can I share these messages on social media?',
					answer:
						'Absolutely! These messages are free to share on WhatsApp, Facebook, Instagram, Twitter, or any platform. Sharing Islamic knowledge (Dawah) is encouraged in Islam. You can copy text or download images for posting.'
				},
				{
					question: 'What languages are available?',
					answer:
						"Currently, we offer Arabic (original), English, and Bangla translations. We're working on adding more languages like Urdu, Turkish, French, and Malay to reach more Muslim communities worldwide."
				},
				{
					question: 'How often are new messages added?',
					answer:
						'We regularly update our collection with new Hadith, Quranic verses, and Islamic greetings. During Ramadan and Islamic holidays, we add special seasonal messages and duas.'
				},
				{
					question: 'Is there a mobile app for prayer times?',
					answer:
						'Yes! Download our Ramadan Time App for accurate prayer times, Sehri/Iftar alerts, Qibla direction, and daily Islamic reminders. Available for both iOS and Android devices.'
				}
			]
		}
	};

	let copiedIndex = $state<number | null>(null);
	let selectedLanguage = $state<'ar' | 'en' | 'bn'>('ar');
	let autoRotateInterval = $state(10000);

	function copyToClipboard(text: string, index: number) {
		navigator.clipboard.writeText(text).then(() => {
			copiedIndex = index;
			toast.success('Message copied successfully!');
			setTimeout(() => {
				copiedIndex = null;
			}, 2000);
		});
	}

	function getMessageText(message: (typeof messages)[0], lang: 'ar' | 'en' | 'bn') {
		return message[lang];
	}

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Daily Islamic Messages',
		applicationCategory: 'LifestyleApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Read and share daily Islamic quotes, Hadith, and Quranic verses. Available in multiple languages. Download images for social media sharing.',
		featureList: [
			'Daily Hadith',
			'Quranic Verses',
			'Islamic Greetings',
			'Multi-language Support',
			'Arabic Messages',
			'English Translation',
			'Bangla Translation',
			'Copy to Clipboard',
			'Social Media Sharing',
			'Hadith Carousel',
			'Auto-rotation',
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
		title="Daily Islamic Messages and Hadith"
		description="Read and share authentic Hadith, Quranic verses, and Islamic greetings in Arabic, English, and Bangla. Copy and share on social media for daily reminders."
	/>

	<!-- Sticky container - sticky header will unstick when this container ends -->
	<div class="sticky-content-area">
		<!-- Language Selector -->
		<div
			class="sticky top-[89px] z-40 mb-6 flex justify-center rounded-lg bg-white/10 py-4 backdrop-blur-md"
		>
			<div class="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm">
				<button
					class={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
						selectedLanguage === 'ar'
							? 'bg-white text-slate-900 shadow-sm  '
							: 'text-slate-600 hover:text-slate-900 '
					}`}
					onclick={() => (selectedLanguage = 'ar')}
				>
					Arabic
				</button>
				<button
					class={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
						selectedLanguage === 'en'
							? 'bg-white text-slate-900 shadow-sm '
							: 'text-slate-600 hover:text-slate-900 '
					}`}
					onclick={() => (selectedLanguage = 'en')}
				>
					English
				</button>
				<button
					class={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
						selectedLanguage === 'bn'
							? 'bg-white text-slate-900 shadow-sm '
							: 'text-slate-600 hover:text-slate-900 '
					}`}
					onclick={() => (selectedLanguage = 'bn')}
				>
					Bangla
				</button>
			</div>
		</div>

		<!-- Messages Grid -->
		<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
			{#each messages as message, i}
				<Card class="flex flex-row items-center justify-between p-5 transition-all hover:shadow-md">
					<div class="flex flex-col items-start text-left">
						<p class="font-arabic mb-1 text-2xl font-bold text-slate-900">
							{getMessageText(message, selectedLanguage)}
						</p>
						<p class="text-base font-medium text-slate-800">
							{message.transliteration}
						</p>
					</div>
					<div class="ml-4 shrink-0">
						<Tooltip text={copiedIndex === i ? 'Copied!' : 'Copy message'}>
							<Button
								variant="outline"
								size="sm"
								class="p-2"
								onclick={() => copyToClipboard(getMessageText(message, selectedLanguage), i)}
								aria-label={`Copy ${getMessageText(message, selectedLanguage)}`}
							>
								{#if copiedIndex === i}
									<span in:fade={{ duration: 100 }}>
										<Check class="h-5 w-5 text-green-600" />
									</span>
								{:else}
									<span in:fade={{ duration: 100 }}>
										<Copy class="h-5 w-5" />
									</span>
								{/if}
							</Button>
						</Tooltip>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Hadith Carousel Section -->
		<section class="mt-12 border-t border-white/20 pt-8" aria-labelledby="hadith-heading">
			<h2 id="hadith-heading" class="mb-6 text-center text-2xl font-bold text-white">
				Hadith Collection
			</h2>
			<div class="mb-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
				<div class="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm">
					<button
						class={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
							selectedLanguage === 'ar'
								? 'bg-white text-slate-900 shadow-sm '
								: 'text-slate-600 hover:text-slate-900 '
						}`}
						onclick={() => (selectedLanguage = 'ar')}
					>
						Arabic
					</button>
					<button
						class={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
							selectedLanguage === 'en'
								? 'bg-white text-slate-900 shadow-sm '
								: 'text-slate-600 hover:text-slate-900 '
						}`}
						onclick={() => (selectedLanguage = 'en')}
					>
						English
					</button>
					<button
						class={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
							selectedLanguage === 'bn'
								? 'bg-white text-slate-900 shadow-sm '
								: 'text-slate-600 hover:text-slate-900 '
						}`}
						onclick={() => (selectedLanguage = 'bn')}
					>
						Bangla
					</button>
				</div>
				<div class="flex items-center gap-3">
					<label for="speed-control" class="text-sm font-medium text-white"> Speed: </label>
					<Select
						id="speed-control"
						bind:value={autoRotateInterval}
						options={[
							{ value: 5000, label: 'Fast (5s)' },
							{ value: 7000, label: 'Normal (7s)' },
							{ value: 10000, label: 'Slow (10s)' },
							{ value: 15000, label: 'Very Slow (15s)' }
						]}
						class="w-40"
					/>
				</div>
			</div>
			<HadithCarousel {hadiths} bind:selectedLanguage {autoRotateInterval} />
		</section>

		<!-- Upsell: Ramadan Time App -->
		<div
			class="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
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
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div class="flex-1">
						<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
							🕌 Get accurate Prayer Times & Sehri/Iftar alerts
						</h3>
						<p class="text-sm text-blue-700 dark:text-blue-400">
							Download our Ramadan Time App for precise prayer times, Qibla direction, and daily
							Islamic reminders on your mobile device.
						</p>
					</div>
				</div>
				<a
					href="https://play.google.com/store/apps/details?id=com.devxhub.muslimtimespro&pcampaignid=web_share"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					Download Ramadan Time App
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
			title="Download: Ramadan & Daily Duas Printable Calendar"
			description="A beautiful, printable calendar featuring daily messages and duas for easy offline reference."
			toolName="Daily Islamic Messages"
			hookText="Perfect for homes, mosques, and Islamic centers. Includes daily Hadith, Quranic verses, and Ramadan-specific duas in multiple languages."
			buttonText="Download Free Calendar"
		/>
	</div>

	<!-- Service CTA -->
	<div class="mt-10">
		<CTA
			title="Need a Mobile App for Your Community or Organization?"
			description="We build custom Islamic apps with prayer times, Quran features, donation systems, and community engagement tools."
			buttonText="Hire Mobile App Developers"
			buttonUrl="https://www.devxhub.com/mobile-app-development"
		/>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

	.font-arabic {
		font-family: 'Amiri', serif;
	}
</style>
