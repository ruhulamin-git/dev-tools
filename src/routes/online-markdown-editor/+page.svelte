<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { onMount } from 'svelte';
	import { lastSaved, markdown, saveStatus, showPreview } from './utils/editorStore';
	// @ts-ignore - codemirror packages have no type declarations in this project
	import type { EditorView } from '@codemirror/view';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use the Online Markdown Editor',
			steps: [
				{
					title: 'Write Your Markdown',
					description:
						'Start typing in the editor pane using Markdown syntax. The editor supports all standard Markdown features including headers, lists, links, images, code blocks, and tables. Use the toolbar for quick formatting or type syntax manually.'
				},
				{
					title: 'Preview in Real-Time',
					description:
						'See your formatted content instantly in the live preview pane. The preview updates as you type, showing exactly how your Markdown will look when rendered. Toggle between editor-only, preview-only, or split view.'
				},
				{
					title: 'Use the Cheat Sheet',
					description:
						'Click the cheat sheet icon to view common Markdown syntax examples. Insert pre-formatted snippets for tables, code blocks, and other complex elements. Perfect for learning Markdown or quick reference.'
				},
				{
					title: 'Export Your Work',
					description:
						'Download your content as raw .md file, compiled .html, or styled .pdf. All exports maintain proper formatting. Your work is auto-saved in your browser—never lose progress.'
				}
			]
		},
		comparison: {
			title: 'Markdown vs. Rich Text Editors: Which is Better?',
			description:
				'Understanding when to use Markdown versus traditional WYSIWYG editors helps you choose the right tool for your content creation workflow.',
			headers: ['Feature', 'Markdown', 'Rich Text Editors (WYSIWYG)'],
			rows: [
				{
					label: 'Learning Curve',
					columns: ['Simple syntax, 10 minutes to learn', 'Intuitive but feature-heavy']
				},
				{
					label: 'File Size',
					columns: ['Tiny plain text files', 'Larger with embedded formatting']
				},
				{
					label: 'Version Control',
					columns: ['Perfect for Git (readable diffs)', 'Difficult (binary or complex HTML)']
				},
				{
					label: 'Portability',
					columns: ['Works everywhere (plain text)', 'Platform-dependent']
				},
				{
					label: 'Speed',
					columns: ['Fast typing, no mouse needed', 'Slower, requires clicking']
				},
				{
					label: 'Best For',
					columns: [
						'Documentation, README files, technical writing',
						'Blog posts, newsletters, visual content'
					]
				}
			]
		},
		bestPractices: {
			title: 'Markdown Best Practices for Documentation',
			practices: [
				'Use descriptive headers: Structure your document with clear H1, H2, H3 hierarchy for better readability and SEO.',
				'Add alt text to images: Always include descriptive alt text in image syntax: ![Alt text](image.jpg) for accessibility.',
				'Use code blocks with language: Specify the language for syntax highlighting: ```javascript for better code presentation.',
				'Keep lines under 80 characters: Break long lines for better readability in plain text editors and version control.',
				'Use relative links for internal docs: Link to other markdown files with relative paths for portable documentation.',
				'Preview before publishing: Always check the rendered output to catch formatting issues and broken links.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is Markdown and why should I use it?',
					answer:
						"Markdown is a lightweight markup language that uses plain text formatting syntax. It's widely used for README files, documentation, forums (Reddit, Stack Overflow), and content management systems. Markdown is easy to learn, portable, works with version control (Git), and can be converted to HTML, PDF, or other formats."
				},
				{
					question: 'How do I create a table in Markdown?',
					answer:
						'Use pipes (|) and hyphens (-) to create tables. Example: | Header 1 | Header 2 | followed by |----------|----------| and then data rows. Our editor includes a table generator tool for easy table creation without memorizing syntax.'
				},
				{
					question: 'Can I export my Markdown to PDF or HTML?',
					answer:
						'Yes! Use the export buttons in the toolbar to download your content as: 1) Raw .md file for editing, 2) Compiled .html for web publishing, or 3) Styled .pdf for sharing or printing. All exports maintain proper formatting and styling.'
				},
				{
					question: 'Is my content saved automatically?',
					answer:
						"Yes! Your Markdown content is automatically saved to your browser's local storage as you type. You'll never lose your work, even if you close the tab or refresh the page. The save status indicator shows when your content was last saved."
				},
				{
					question: 'Does this editor support GitHub Flavored Markdown (GFM)?',
					answer:
						'Yes! Our editor supports GitHub Flavored Markdown including task lists (- [ ] Todo), tables, strikethrough (~~text~~), and fenced code blocks with syntax highlighting. Perfect for creating README files and GitHub documentation.'
				}
			]
		}
	};

	// Lazy load heavy components
	let Editor: any;
	let Preview: any;
	let Toolbar: any;
	let Cheatsheet: any;
	let TableGenerator: any;
	let componentsLoaded = $state(false);

	onMount(async () => {
		// Lazy load all components for better performance
		const [EditorModule, PreviewModule, ToolbarModule, CheatsheetModule, TableGeneratorModule] =
			await Promise.all([
				import('./components/Editor.svelte'),
				import('./components/Preview.svelte'),
				import('./components/Toolbar.svelte'),
				import('./components/Cheatsheet.svelte'),
				import('./components/TableGenerator.svelte')
			]);

		Editor = EditorModule.default;
		Preview = PreviewModule.default;
		Toolbar = ToolbarModule.default;
		Cheatsheet = CheatsheetModule.default;
		TableGenerator = TableGeneratorModule.default;
		componentsLoaded = true;
	});

	let editorView = $state<EditorView | undefined>(undefined);
	let isTableModalOpen = $state(false);
	let isFullscreen = $state(false);
	let editorContainer: HTMLDivElement;

	let splitPercent = $state(50);
	let isDragging = false;
	let container: HTMLDivElement;

	function toggleFullscreen() {
		if (!editorContainer) return;
		if (!document.fullscreenElement) {
			editorContainer.requestFullscreen();
			isFullscreen = true;
		} else {
			document.exitFullscreen();
			isFullscreen = false;
		}
	}

	$effect(() => {
		const handleFullscreenChange = () => {
			isFullscreen = !!document.fullscreenElement;
		};
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});

	let scrollRatio = $state(0);

	let wordCount = $derived($markdown.split(/\s+/).filter((w) => w.length > 0).length);
	let charCount = $derived($markdown.length);

	// Detect if user is writing a lot of text (for Lorem Ipsum upsell)
	let isWritingLongContent = $derived(charCount > 500);

	let saveTimeDisplay = $derived.by(() => {
		if ($saveStatus === 'saving') return 'Saving...';
		if ($saveStatus === 'unsaved') return 'Unsaved';
		if (!$lastSaved) return '';
		const now = new Date();
		const diff = Math.floor((now.getTime() - $lastSaved.getTime()) / 1000);
		if (diff < 5) return 'Saved just now';
		return `Saved ${diff}s ago`;
	});

	$effect(() => {
		const interval = setInterval(() => {
			lastSaved.update((d) => d);
		}, 5000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if ($saveStatus === 'saving' || $saveStatus === 'unsaved') {
				e.preventDefault();
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	function startDrag(_e: MouseEvent) {
		if (!$showPreview) return;
		isDragging = true;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
		window.addEventListener('mousemove', handleDrag);
		window.addEventListener('mouseup', stopDrag);
	}

	function handleDrag(e: MouseEvent) {
		if (!isDragging || !container) return;
		const rect = container.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const p = (x / rect.width) * 100;
		splitPercent = Math.min(Math.max(p, 35), 65);
	}

	function stopDrag() {
		isDragging = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		window.removeEventListener('mousemove', handleDrag);
		window.removeEventListener('mouseup', stopDrag);
	}

	function handleTableInsert(md: string) {
		if (!editorView) return;
		const { state, dispatch } = editorView;
		const selection = state.selection.main;
		dispatch({
			changes: { from: selection.from, insert: md },
			selection: { anchor: selection.from + md.length }
		});
		editorView.focus();
	}

	let editorScrollTop = $state(0);

	function handleEditorScroll(_scrollTop: number, ratio: number) {
		scrollRatio = ratio;
	}

	function handlePreviewScroll(_scrollTop: number, ratio: number) {
		if (!editorView) return;
		const scroller = editorView.scrollDOM;
		const { scrollHeight, clientHeight } = scroller;
		const maxScroll = scrollHeight - clientHeight;
		if (maxScroll > 0) editorScrollTop = maxScroll * ratio;
	}

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Online Markdown Editor',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Write and preview Markdown in real-time. Convert Markdown to HTML or PDF instantly. Supports tables, code blocks, and images. Free, private, and no sign-up required.',
		featureList: [
			'Live Markdown Preview',
			'Syntax Highlighting',
			'Export to HTML',
			'Export to PDF',
			'Export to Markdown',
			'Table Generator',
			'Code Block Support',
			'Image Support',
			'Auto-Save',
			'GitHub Flavored Markdown',
			'Cheat Sheet',
			'Client-Side Processing',
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
		title="Free Online Markdown Editor"
		description="Write and preview Markdown in real-time. Convert to HTML or PDF instantly. Supports tables, code blocks, and images. 100% client-side—your content never leaves your browser."
	/>

	<section aria-label="Markdown editor interface">
		{#if !componentsLoaded}
			<div
				class="flex h-[800px] items-center justify-center rounded-xl border border-slate-200 bg-white"
			>
				<div class="text-center">
					<div
						class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"
					></div>
					<p class="text-slate-600">Loading editor...</p>
				</div>
			</div>
		{:else}
			<div
				bind:this={editorContainer}
				class="relative flex h-[800px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
				class:h-screen={isFullscreen}
				class:rounded-none={isFullscreen}
			>
				<div class="z-20 flex-shrink-0 border-b border-slate-200 bg-white">
					<svelte:component
						this={Toolbar}
						view={editorView}
						onOpenTableModal={() => (isTableModalOpen = true)}
						{isFullscreen}
						onToggleFullscreen={toggleFullscreen}
					/>
				</div>

				<div
					class="relative flex flex-1 flex-col overflow-hidden md:flex-row"
					bind:this={container}
				>
					{#if $showPreview}
						<div
							class="editor-pane flex flex-col overflow-hidden transition-all duration-75"
							style:--split-width="{splitPercent}%"
						>
							<div
								class="block border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 md:hidden"
							>
								Editor
							</div>
							<svelte:component
								this={Editor}
								bind:view={editorView}
								onScroll={handleEditorScroll}
								scrollTop={editorScrollTop}
							/>
						</div>
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							role="separator"
							aria-orientation="vertical"
							aria-valuenow={splitPercent}
							class="z-10 hidden h-full w-1.5 flex-shrink-0 cursor-col-resize border-r border-l border-slate-200 bg-slate-50 transition-colors hover:bg-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] md:block"
							onmousedown={startDrag}
						></div>
					{/if}

					<div
						class="preview-pane relative overflow-hidden border-t border-slate-200 md:border-t-0"
						class:flex-1={true}
					>
						<div
							class="block border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 md:hidden"
						>
							Preview
						</div>
						<svelte:component this={Preview} {scrollRatio} onScroll={handlePreviewScroll} />
					</div>

					<svelte:component this={Cheatsheet} onInsert={handleTableInsert} />
				</div>

				<div
					class="z-20 flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-1 text-xs text-slate-500 select-none"
				>
					<div class="flex gap-4">
						<span>Words: <strong class="text-slate-700">{wordCount}</strong></span>
						<span>Chars: <strong class="text-slate-700">{charCount}</strong></span>
					</div>
					<div class="flex items-center gap-2">
						{#if $saveStatus === 'saving'}<span class="animate-pulse">Saving...</span>{:else}<span
								>{saveTimeDisplay}</span
							>{/if}
					</div>
				</div>

				<svelte:component
					this={TableGenerator}
					bind:isOpen={isTableModalOpen}
					onInsert={handleTableInsert}
				/>
			</div>
		{/if}
	</section>

	<!-- Internal Linking - Lorem Ipsum Generator Upsell (when writing long content) -->
	{#if isWritingLongContent}
		<div
			class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
		>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
						📄 Need dummy text to fill out the layout first?
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Use our Lorem Ipsum Generator to quickly create placeholder text for your design
						mockups.
					</p>
				</div>
				<a
					href="https://www.devxhub.com/tools/lorem-ipsum-generator"
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
					Generate Lorem Ipsum
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
			title="Download: The Complete Markdown Syntax Guide"
			description="Master Markdown syntax with our comprehensive cheat sheet. Perfect for developers and technical writers."
			toolName="Markdown Editor"
			hookText="Learn all Markdown syntax in one place. Includes GitHub Flavored Markdown, tables, code blocks, and advanced formatting techniques. Essential for README files and documentation."
			buttonText="Download Free Guide"
		/>
	</div>

	<!-- General CTA -->
	<div class="mt-10">
		<CTA
			title="Need a Custom CMS or Documentation Site?"
			description="Static files are great, but scaling content is hard. We build headless CMS solutions (Strapi/Contentful) for enterprise teams."
			buttonText="Hire Web Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>

<style>
	.editor-pane {
		width: 100%;
		flex: 1 1 50%;
		min-height: 0;
		height: 50%;
		display: flex;
		flex-direction: column;
	}
	.preview-pane {
		flex: 1 1 50%;
		min-height: 0;
		height: 50%;
		display: flex;
		flex-direction: column;
	}
	@media (min-width: 768px) {
		.editor-pane {
			width: var(--split-width, 50%);
			flex: none;
			height: 100%;
		}
		.preview-pane {
			flex: 1;
			height: 100%;
		}
	}

	/* Mobile specific fixes */
	@media (max-width: 767px) {
		.editor-pane {
			border-bottom: 2px solid rgb(203 213 225);
			margin-bottom: 0;
		}
		.preview-pane {
			border-top: none;
			margin-top: 0;
		}
	}
</style>
