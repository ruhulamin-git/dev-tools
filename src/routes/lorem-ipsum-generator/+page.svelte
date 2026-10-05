<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import LoremInput from './components/LoremInput.svelte';
	import LoremOutput from './components/LoremOutput.svelte';
	import type { GenerationType, OutputFormat, PlaceholderType } from './utils/loremGenerator';
	import { generateLoremIpsum, validateQuantity } from './utils/loremGenerator';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Generate Lorem Ipsum Text',
			steps: [
				{
					title: 'Choose Text Type',
					description:
						'Select from classic Lorem Ipsum, Hipster Ipsum, or Bacon Ipsum. Lorem Ipsum is the traditional choice for professional designs. Hipster and Bacon Ipsum add personality to casual projects.'
				},
				{
					title: 'Select Generation Type',
					description:
						'Choose paragraphs for body text, sentences for shorter content, or words for headlines and labels. Adjust the quantity to match your design needs.'
				},
				{
					title: 'Pick Output Format',
					description:
						'Select plain text for simple copy-paste, HTML for web development, or Markdown for documentation. The format determines how the text is structured.'
				},
				{
					title: 'Copy and Use',
					description:
						'Click the copy button to copy the generated text to your clipboard. Paste it into your design mockups, wireframes, or development projects instantly.'
				}
			]
		},
		comparison: {
			title: 'What is Lorem Ipsum? (History and Purpose)',
			description:
				'Understanding the origins and purpose of Lorem Ipsum helps you use placeholder text effectively in your design workflow.',
			headers: ['Aspect', 'Details'],
			rows: [
				{
					label: 'Origin',
					columns: [
						'Derived from Cicero\'s "De Finibus Bonorum et Malorum" (45 BC), a Latin text about ethics'
					]
				},
				{
					label: 'First Use',
					columns: ["1500s - A printer scrambled Cicero's text to create a type specimen book"]
				},
				{
					label: 'Why Latin?',
					columns: [
						'Latin looks like readable text but has no meaning, preventing distraction from design'
					]
				},
				{
					label: 'Purpose',
					columns: [
						'Focus on layout, typography, and visual design without being distracted by content'
					]
				},
				{
					label: 'Modern Use',
					columns: [
						'Wireframes, mockups, prototypes, and web development before final content is ready'
					]
				},
				{
					label: 'Translation',
					columns: [
						'The standard passage translates to: "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain..."'
					]
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Using Placeholder Text',
			practices: [
				'Use Lorem Ipsum for Professional Work: Classic Lorem Ipsum is neutral and professional. Save Hipster or Bacon Ipsum for casual or humorous projects.',
				'Match Real Content Length: Generate placeholder text that matches the expected length of final content to test realistic layouts and line breaks.',
				'Replace Before Launch: Never ship Lorem Ipsum to production. It looks unprofessional and hurts SEO. Always replace with real content before going live.',
				'Test with Real Content Early: Lorem Ipsum can hide design problems. Test with actual content as soon as possible to catch issues like text overflow or poor readability.',
				'Use Meaningful Placeholders: For forms and UI elements, use descriptive placeholders like "Enter your email" instead of Lorem Ipsum for better UX.',
				'Consider Accessibility: Screen readers will read Lorem Ipsum aloud. Use aria-label or real content for accessible prototypes and demos.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What does Lorem Ipsum mean in English?',
					answer:
						'The standard Lorem Ipsum passage comes from Cicero\'s "De Finibus Bonorum et Malorum" (45 BC). The full translation is: "There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain..." The text was scrambled in the 1500s to create meaningless but readable placeholder text.'
				},
				{
					question: 'Why do designers use Lorem Ipsum instead of real text?',
					answer:
						'Lorem Ipsum allows designers to focus on layout, typography, and visual hierarchy without being distracted by content. Real text can bias design decisions or distract stakeholders from evaluating the design itself. Lorem Ipsum looks like readable text but has no meaning.'
				},
				{
					question: 'When should I stop using Lorem Ipsum?',
					answer:
						'Replace Lorem Ipsum with real content as early as possible in the design process. Real content reveals issues like text overflow, poor readability, or awkward line breaks that Lorem Ipsum might hide. Never ship Lorem Ipsum to production—it looks unprofessional and hurts SEO.'
				},
				{
					question: 'What is the difference between paragraphs, sentences, and words?',
					answer:
						'Paragraphs generate full blocks of text for body content. Sentences generate shorter text for captions or descriptions. Words generate individual words for headlines, labels, or buttons. Choose based on what type of content you need to simulate in your design.'
				},
				{
					question: 'Can I use Lorem Ipsum for SEO or production websites?',
					answer:
						'No! Never use Lorem Ipsum on live websites. Search engines penalize sites with placeholder text, and it looks unprofessional to users. Always replace Lorem Ipsum with real, meaningful content before launching. Use it only for mockups, wireframes, and development.'
				}
			]
		}
	};

	let placeholderType = $state<PlaceholderType>('lorem');
	let generationType = $state<GenerationType>('paragraphs');
	let outputFormat = $state<OutputFormat>('plain');
	let quantity = $state(3);
	let startWithLorem = $state(true);
	let output = $state('');
	let error = $state('');
	let isGenerating = $state(false);

	const generate = () => {
		error = '';
		const validation = validateQuantity(quantity);
		if (!validation.valid) {
			error = validation.error || 'Invalid quantity';
			output = '';
			return;
		}

		isGenerating = true;
		setTimeout(() => {
			try {
				output = generateLoremIpsum({
					type: placeholderType,
					generationType,
					quantity,
					outputFormat,
					startWithLorem
				});
			} catch {
				error = 'Failed to generate text. Please try again.';
				output = '';
			}
			isGenerating = false;
		}, 10);
	};

	// Generate on mount and when options change
	$effect(() => {
		placeholderType;
		generationType;
		outputFormat;
		quantity;
		startWithLorem;
		generate();
	});

	const handleReset = () => {
		placeholderType = 'lorem';
		generationType = 'paragraphs';
		outputFormat = 'plain';
		quantity = 3;
		startWithLorem = true;
		error = '';
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Lorem Ipsum Generator',
		applicationCategory: 'DesignApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Generate random Lorem Ipsum placeholder text for your designs. Choose paragraphs, sentences, or words. Copy to clipboard instantly.',
		featureList: [
			'Lorem Ipsum Generation',
			'Hipster Ipsum',
			'Bacon Ipsum',
			'Paragraph Generation',
			'Sentence Generation',
			'Word Generation',
			'Plain Text Output',
			'HTML Output',
			'Markdown Output',
			'Copy to Clipboard',
			'Customizable Quantity',
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
		title="Free Lorem Ipsum Generator"
		description="Generate random Lorem Ipsum placeholder text for your designs. Choose paragraphs, sentences, or words. Copy to clipboard instantly—perfect for mockups and wireframes."
	/>

	<div class="space-y-4 sm:space-y-6">
		<LoremInput
			{placeholderType}
			{generationType}
			{outputFormat}
			{quantity}
			{startWithLorem}
			{isGenerating}
			onPlaceholderTypeChange={(t) => (placeholderType = t)}
			onGenerationTypeChange={(t) => (generationType = t)}
			onOutputFormatChange={(f) => (outputFormat = f)}
			onQuantityChange={(q) => (quantity = q)}
			onStartWithLoremChange={(e) => (startWithLorem = e)}
			onGenerate={generate}
			onReset={handleReset}
		/>

		<LoremOutput {output} {error} />

		<!-- Upsell: Fake Data Generator -->
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
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
					<div class="flex-1">
						<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
							🎭 Need real-looking user data instead of Latin?
						</h3>
						<p class="text-sm text-blue-700 dark:text-blue-400">
							Generate realistic names, emails, addresses, and more with our Fake Data Generator for
							better prototypes.
						</p>
					</div>
				</div>
				<a
					href="https://fake.devxhub.com"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					Try Fake Data Generator
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
			title="Download: Wireframing 101 - Moving from Content to Code"
			description="Learn when to use placeholders and when to demand real content for better designs."
			toolName="Lorem Ipsum Generator"
			hookText="Prevent design breaking when real content replaces placeholder text. Learn content-first design principles, responsive typography strategies, and how to handle dynamic content. Essential for UI/UX designers."
			buttonText="Download Free Guide"
		/>
	</div>

	<!-- Conversion CTA -->
	<div class="mt-10">
		<CTA
			title="Design is Done. Who Builds It?"
			description="Don't let a bad implementation ruin your design. Our frontend developers build pixel-perfect interfaces from Figma/Sketch with clean, maintainable code."
			buttonText="Hire Frontend Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
