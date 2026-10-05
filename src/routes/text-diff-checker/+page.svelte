<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { DiffControls, DiffFeatures, DiffInput, DiffResults, Toast } from './components';
	import { computeDiff, formatDiffForCopy } from './components/diff-utils';
	import type { DiffLine, DiffOptions, DiffStats } from './components/types';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Compare Text and Find Differences',
			steps: [
				{
					title: 'Paste Original Text',
					description:
						'Copy and paste your original text, code, or document into the left panel. You can also upload a text file directly. This serves as your baseline for comparison.'
				},
				{
					title: 'Paste Modified Text',
					description:
						'Copy and paste the modified version into the right panel. This could be an edited document, updated code, or a new version of any text content you want to compare.'
				},
				{
					title: 'View Highlighted Changes',
					description:
						'Differences are automatically highlighted: Green shows additions (new content), Red shows deletions (removed content), and Yellow shows modifications (changed lines). Switch between unified and split view modes.'
				},
				{
					title: 'Copy or Export Results',
					description:
						'Click the copy button to copy the diff results to your clipboard. Use the results for code reviews, documentation updates, or tracking document changes over time.'
				}
			]
		},
		comparison: {
			title: 'Use Cases for Text Diff Checking',
			description:
				'Understanding when to use a diff checker helps you work more efficiently across different scenarios.',
			headers: ['Use Case', 'Scenario', 'Benefit'],
			rows: [
				{
					label: 'Code Reviews',
					columns: [
						'Finding bugs introduced in new code versions',
						'Catch errors before merging to production'
					]
				},
				{
					label: 'Content Editing',
					columns: [
						'Seeing what an editor changed in an article',
						'Track revisions and approve changes'
					]
				},
				{
					label: 'Legal Documents',
					columns: [
						"Verifying contract clauses haven't changed",
						'Ensure compliance and prevent disputes'
					]
				},
				{
					label: 'Version Control',
					columns: ['Comparing Git commits or branches', 'Understand code evolution and history']
				},
				{
					label: 'Plagiarism Detection',
					columns: ['Comparing original vs. submitted work', 'Identify copied or modified content']
				},
				{
					label: 'Configuration Files',
					columns: ['Comparing server configs or environment files', 'Prevent deployment errors']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Text Comparison',
			practices: [
				'Ignore Whitespace for Code: Enable "Ignore Whitespace" when comparing code to focus on actual logic changes, not formatting differences.',
				'Use Character-Level Diff: Enable character-level comparison to see exact changes within lines, not just which lines changed.',
				'Compare Before Merging: Always diff your changes before merging code to catch unintended modifications or conflicts.',
				'Save Baseline Versions: Keep original versions of important documents (contracts, configs) for future comparison and audit trails.',
				'Use Unified View for Reviews: Unified view is better for code reviews as it shows context. Split view is better for side-by-side document comparison.',
				'Automate with CI/CD: Integrate diff checking into your CI/CD pipeline to automatically catch breaking changes before deployment.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is a diff checker and how does it work?',
					answer:
						'A diff checker compares two text files or code snippets and highlights the differences between them. It uses algorithms to identify additions (new content), deletions (removed content), and modifications (changed lines). The results are color-coded: green for additions, red for deletions, and yellow for modifications.'
				},
				{
					question: 'What is the difference between unified and split view?',
					answer:
						'Unified view shows both texts in a single column with changes highlighted inline—great for code reviews and seeing context. Split view shows original and modified text side-by-side in separate columns—better for comparing documents or seeing overall structure differences.'
				},
				{
					question: 'Can I compare code files for code reviews?',
					answer:
						'Yes! Our diff checker is perfect for code reviews. Enable "Ignore Whitespace" to focus on logic changes, and use "Character-Level Diff" to see exact changes within lines. The tool works with any programming language: JavaScript, Python, Java, C++, and more.'
				},
				{
					question: 'How do I compare two versions of a legal document?',
					answer:
						"Paste the original contract or legal document in the left panel and the modified version in the right panel. The tool will highlight all changes, additions, and deletions. This helps verify that critical clauses haven't been altered without your knowledge."
				},
				{
					question: 'Is my text data safe and private?',
					answer:
						'Yes! All text comparison happens entirely in your browser using JavaScript. Your documents, code, or text are never uploaded to our servers, stored in any database, or transmitted over the internet. Your data remains 100% private and secure on your device.'
				}
			]
		}
	};

	// State management
	let originalText = $state('');
	let modifiedText = $state('');
	let originalFileName = $state('');
	let modifiedFileName = $state('');
	let diffResults = $state<DiffLine[]>([]);
	let showToast = $state(false);
	let toastMessage = $state('');

	let options = $state<DiffOptions>({
		ignoreWhitespace: false,
		characterLevelDiff: true,
		unifiedDiff: true,
		viewMode: 'unified'
	});

	// Computed
	let hasBothInputs = $derived(originalText.trim().length > 0 && modifiedText.trim().length > 0);
	let hasAnyContent = $derived(originalText.length > 0 || modifiedText.length > 0);

	// Auto-compare when both inputs have content
	$effect(() => {
		if (hasBothInputs) {
			diffResults = computeDiff(
				originalText,
				modifiedText,
				options.ignoreWhitespace,
				options.characterLevelDiff
			);
		} else {
			diffResults = [];
		}
	});

	let stats = $derived<DiffStats>({
		additions: diffResults.filter((r) => r.type === 'added').length,
		deletions: diffResults.filter((r) => r.type === 'deleted').length,
		modifications: diffResults.filter((r) => r.type === 'modified').length,
		unchanged: diffResults.filter((r) => r.type === 'unchanged').length
	});

	function handleClear() {
		originalText = '';
		modifiedText = '';
		originalFileName = '';
		modifiedFileName = '';
		diffResults = [];
	}

	function handleCopy() {
		if (diffResults.length === 0) return;

		const resultText = formatDiffForCopy(diffResults, options.unifiedDiff);
		navigator.clipboard.writeText(resultText).then(() => {
			toastMessage = 'Copied to clipboard!';
			showToast = true;
			setTimeout(() => {
				showToast = false;
			}, 2500);
		});
	}

	function handleOptionsChange(newOptions: DiffOptions) {
		options = newOptions;
	}

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Online Text Diff Checker',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Compare two text files or code snippets side-by-side. Highlight differences, additions, and deletions instantly. Great for code reviews and document versioning.',
		featureList: [
			'Text Comparison',
			'Code Diff',
			'File Comparison',
			'Highlight Changes',
			'Side-by-Side View',
			'Unified View',
			'Character-Level Diff',
			'Ignore Whitespace',
			'Copy Results',
			'File Upload',
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

<Toast show={showToast} message={toastMessage} />

<div class="flex flex-col gap-6">
	<PageHeader
		title="Online Text Difference Checker"
		description="Compare two text files or code snippets side-by-side. Highlight differences, additions, and deletions instantly—perfect for code reviews and document versioning."
	/>

	<!-- Input Area -->
	<div class="grid min-h-[300px] grid-cols-1 gap-4 sm:min-h-[400px] lg:grid-cols-2 lg:gap-5">
		<DiffInput
			id="original-text"
			label="Original"
			placeholder="Paste original text here..."
			value={originalText}
			fileName={originalFileName}
			variant="original"
			onValueChange={(v: string) => (originalText = v)}
			onFileChange={(f: string) => (originalFileName = f)}
		/>

		<DiffInput
			id="modified-text"
			label="Modified"
			placeholder="Paste modified text here..."
			value={modifiedText}
			fileName={modifiedFileName}
			variant="modified"
			onValueChange={(v: string) => (modifiedText = v)}
			onFileChange={(f: string) => (modifiedFileName = f)}
		/>
	</div>

	<!-- Controls -->
	<DiffControls
		{options}
		hasContent={hasAnyContent}
		showViewToggle={diffResults.length > 0}
		onOptionsChange={handleOptionsChange}
		onClear={handleClear}
	/>

	<!-- Results -->
	<DiffResults
		results={diffResults}
		{stats}
		showResults={hasBothInputs}
		viewMode={options.viewMode}
		onCopy={handleCopy}
	/>

	<!-- Features -->
	<DiffFeatures />

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
			title="Download: The Code Review Checklist for Tech Leads"
			description="Master code review best practices and merge conflict resolution techniques."
			toolName="Text Diff Checker"
			hookText="Learn how to spot critical errors before merging code. Includes code review checklist, common pitfalls, Git workflow strategies, and automated testing integration. Essential for tech leads and senior developers."
			buttonText="Download Free Checklist"
		/>
	</div>

	<!-- Conversion CTA -->
	<div class="mt-10">
		<CTA
			title="Code Reviews Slowing You Down?"
			description="Manual diffs are risky. We implement automated CI/CD pipelines that catch errors before they merge. Get faster deployments with zero downtime."
			buttonText="Hire DevOps Engineers"
			buttonUrl="https://www.devxhub.com/devops-solutions"
		/>
	</div>
</div>
