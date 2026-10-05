<script lang="ts">
	// Lazy load components for better performance
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
	import { getToolBySlug } from '$lib/shared/config/tools';
	import { onMount } from 'svelte';

	const currentTool = getToolBySlug('json-formatter-validator')!;

	// Lazy loaded components
	let JsonEditor: any;
	let JsonTreeView: any;
	let ErrorDisplay: any;
	let componentsLoaded = $state(false);

	onMount(async () => {
		const [EditorModule, TreeModule, ErrorModule] = await Promise.all([
			import('./components/JsonEditor.svelte'),
			import('./components/JsonTreeView.svelte'),
			import('./components/ErrorDisplay.svelte')
		]);
		JsonEditor = EditorModule.default;
		JsonTreeView = TreeModule.default;
		ErrorDisplay = ErrorModule.default;
		componentsLoaded = true;
	});

	import {
		copyToClipboard,
		downloadFile,
		formatJson,
		getJsonStats,
		jsonToCsv,
		jsonToXml,
		jsonToYaml,
		minifyJson,
		validateJson,
		type JsonStats
	} from './components/utils';

	// State
	let inputJson = $state('');
	let outputJson = $state('');
	let validationError = $state<{ message: string; line?: number; column?: number } | null>(null);
	let parsedData = $state<unknown>(null);
	let stats = $state<JsonStats | null>(null);
	let copySuccess = $state(false);
	let rightPanelView = $state<'formatted' | 'tree'>('formatted');
	let indentSize = $state(2);
	let indentDropdownOpen = $state(false);

	let fileInput: HTMLInputElement;

	const indentOptions = [
		{ value: 2, label: '2 spaces' },
		{ value: 4, label: '4 spaces' }
	];

	function selectIndent(value: number) {
		indentSize = value;
		indentDropdownOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.indent-dropdown')) {
			indentDropdownOpen = false;
		}
	}

	// Validate and format on input change
	$effect(() => {
		if (inputJson.trim()) {
			const result = validateJson(inputJson);
			if (result.isValid) {
				validationError = null;
				parsedData = result.parsed;
				stats = getJsonStats(result.parsed);
				outputJson = JSON.stringify(result.parsed, null, indentSize);
			} else {
				validationError = result.error || null;
				parsedData = null;
				stats = null;
				outputJson = '';
			}
		} else {
			validationError = null;
			parsedData = null;
			stats = null;
			outputJson = '';
		}
	});

	function handleFormat() {
		try {
			inputJson = formatJson(inputJson, indentSize);
		} catch {}
	}

	function handleMinify() {
		try {
			inputJson = minifyJson(inputJson);
		} catch {}
	}

	async function handleCopy() {
		const textToCopy = outputJson || inputJson;
		if (!textToCopy.trim()) return;
		const success = await copyToClipboard(textToCopy);
		if (success) {
			copySuccess = true;
			setTimeout(() => (copySuccess = false), 2000);
		}
	}

	function handleClear() {
		inputJson = '';
		outputJson = '';
	}

	function handleDownload() {
		const content = outputJson || inputJson;
		if (!content.trim()) return;
		downloadFile(content, 'data.json', 'application/json');
	}

	function handleUpload() {
		fileInput?.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		if (file.size > 10 * 1024 * 1024) {
			alert('File size exceeds 10MB limit');
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			inputJson = event.target?.result as string;
		};
		reader.readAsText(file);
		target.value = '';
	}

	function handleConvertCsv() {
		if (!parsedData) return;
		try {
			downloadFile(jsonToCsv(parsedData), 'data.csv', 'text/csv');
		} catch (e) {
			alert((e as Error).message);
		}
	}

	function handleConvertXml() {
		if (!parsedData) return;
		try {
			downloadFile(jsonToXml(parsedData), 'data.xml', 'application/xml');
		} catch (e) {
			alert((e as Error).message);
		}
	}

	function handleConvertYaml() {
		if (!parsedData) return;
		try {
			downloadFile(jsonToYaml(parsedData), 'data.yaml', 'application/yaml');
		} catch (e) {
			alert((e as Error).message);
		}
	}

	const sampleJson = `{"name":"John Doe","age":30,"email":"john@example.com","isActive":true,"roles":["admin","user"],"address":{"street":"123 Main St","city":"New York","country":"USA"}}`;

	function loadSample() {
		inputJson = sampleJson;
	}

	let isValid = $derived(inputJson.trim() && !validationError);

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Format and Validate JSON',
			steps: [
				{
					title: 'Paste Your JSON',
					description:
						'Copy your raw JSON string from your API response, configuration file, or database query and paste it into the left editor panel. You can also upload a JSON file directly using the Upload button.'
				},
				{
					title: 'Click Format to Beautify',
					description:
						'Click the "Beautify" button to automatically format your JSON with proper indentation and line breaks. Choose between 2-space or 4-space indentation based on your coding standards. The tool will instantly make your JSON human-readable.'
				},
				{
					title: 'Click Validate to Check for Syntax Errors',
					description:
						'The validator automatically detects common JSON errors like trailing commas, missing quotes, incorrect data types, and unclosed brackets. Error messages show the exact line and column number where the problem occurs.'
				},
				{
					title: 'Use Tree View or Export',
					description:
						'Switch to Tree View to navigate large datasets by collapsing and expanding nodes. Export your validated JSON or convert it to CSV, XML, or YAML formats for use in different systems.'
				}
			]
		},
		comparison: {
			title: 'Tree View vs. Code View: Which Should You Use?',
			description:
				'Our JSON formatter offers two visualization modes to help you work with JSON data more effectively. Choose the view that best fits your workflow and data complexity.',
			headers: ['Feature', 'Code View', 'Tree View'],
			rows: [
				{
					label: 'Best For',
					columns: [
						'Editing and copying JSON text',
						'Exploring nested structures and large datasets'
					]
				},
				{
					label: 'Navigation',
					columns: [
						'Scroll through formatted text',
						'Collapse/expand nodes to focus on specific sections'
					]
				},
				{
					label: 'Use Case',
					columns: ['API debugging, configuration files', 'Complex nested objects, data analysis']
				},
				{
					label: 'Editing',
					columns: ['Direct text editing supported', 'Read-only visualization']
				}
			]
		},
		bestPractices: {
			title: 'Common JSON Errors We Fix',
			practices: [
				'Trailing commas: JSON does not allow commas after the last item in arrays or objects. Our validator detects and highlights these errors.',
				'Missing quotes: All JSON keys must be wrapped in double quotes. Single quotes are not valid in JSON.',
				'Incorrect data types: Ensure booleans are lowercase (true/false), numbers have no quotes, and strings are properly escaped.',
				'Unclosed brackets: Every opening bracket { or [ must have a matching closing bracket } or ].',
				'Invalid escape sequences: Use proper escape characters like \\n for newlines, \\t for tabs, and \\\\ for backslashes.',
				'Unicode issues: Ensure proper UTF-8 encoding for special characters and emojis in JSON strings.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between JSON formatting and validation?',
					answer:
						'Validation checks if your JSON syntax is correct and follows the JSON specification. Formatting (beautifying) adds proper indentation and line breaks to make valid JSON more readable. Our tool does both automatically.'
				},
				{
					question: 'Can I convert JSON to other formats?',
					answer:
						'Yes! Our tool supports converting JSON to CSV (for spreadsheets), XML (for legacy systems), and YAML (for configuration files). Simply validate your JSON and click the format you need.'
				},
				{
					question: 'Is my JSON data safe? Do you store it?',
					answer:
						'Your JSON data is processed entirely in your browser using JavaScript. We never send your data to our servers, store it in any database, or transmit it over the internet. Your data remains completely private.'
				},
				{
					question: 'What is the file size limit?',
					answer:
						'Our tool can handle JSON files up to 10MB in size. For larger files, consider breaking them into smaller chunks or using a desktop JSON editor.'
				},
				{
					question: 'Why use Tree View for large JSON files?',
					answer:
						"Tree View allows you to collapse and expand nested objects and arrays, making it easier to navigate complex data structures without scrolling through thousands of lines. It's perfect for exploring API responses with deep nesting."
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'JSON Formatter & Validator',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Validate, format, and beautify your JSON data instantly. Detect syntax errors online with tree view, minification, and privacy-focused local processing.',
		featureList: [
			'JSON Validation',
			'JSON Beautification',
			'JSON Minification',
			'Syntax Error Detection',
			'Tree View Navigation',
			'JSON to CSV Conversion',
			'JSON to XML Conversion',
			'JSON to YAML Conversion',
			'Client-Side Processing',
			'No Data Storage',
			'File Upload Support',
			'Copy & Download'
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

<svelte:window onclick={handleClickOutside} />

<input
	bind:this={fileInput}
	type="file"
	accept=".json,.txt"
	class="hidden"
	onchange={handleFileChange}
/>

<article class="w-full space-y-4">
	<PageHeader
		title="Online JSON Formatter and Validator"
		description="Validate, format, and beautify your JSON data instantly. Detect syntax errors, explore with tree view, and convert to CSV, XML, or YAML. Privacy-focused local processing."
	/>
	<TrustStrip />

	<section aria-label="JSON formatter interface">
		<!-- Toolbar -->
		<div
			class="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
		>
			<button
				onclick={handleUpload}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
					/></svg
				>
				Upload
			</button>
			<button
				onclick={loadSample}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/></svg
				>
				Sample
			</button>

			<div class="h-6 w-px bg-gray-200 dark:bg-slate-600"></div>

			<button
				onclick={handleFormat}
				disabled={!isValid}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16m-7 6h7"
					/></svg
				>
				Beautify
			</button>
			<button
				onclick={handleMinify}
				disabled={!isValid}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 12H4"
					/></svg
				>
				Minify
			</button>

			<div class="h-6 w-px bg-gray-200 dark:bg-slate-600"></div>

			<button
				onclick={handleCopy}
				disabled={!inputJson.trim()}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 {copySuccess
					? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
					: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
			>
				{#if copySuccess}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/></svg
					>
					Copied!
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/></svg
					>
					Copy
				{/if}
			</button>
			<button
				onclick={handleDownload}
				disabled={!isValid}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
				>JSON</button
			>
			<button
				onclick={handleConvertCsv}
				disabled={!isValid}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
				>CSV</button
			>
			<button
				onclick={handleConvertXml}
				disabled={!isValid}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
				>XML</button
			>
			<button
				onclick={handleConvertYaml}
				disabled={!isValid}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
				>YAML</button
			>

			<div class="flex-1"></div>

			<!-- Indent Selection -->
			<Select
				bind:value={indentSize}
				options={indentOptions}
				ariaLabel="Indent size"
				class="w-28"
			/>

			<button
				onclick={handleClear}
				disabled={!inputJson.trim()}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
				aria-label="Clear input"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/></svg
				>
			</button>
		</div>

		<!-- Error Display -->
		{#if validationError && componentsLoaded}
			<svelte:component this={ErrorDisplay} error={validationError} />
		{/if}

		{#if !componentsLoaded}
			<div
				class="flex h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
			>
				<div class="text-center">
					<div
						class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"
					></div>
					<p class="text-slate-600">Loading editor...</p>
				</div>
			</div>
		{:else}
			<!-- Two Panel Layout -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<!-- Left Panel: Input -->
				<div
					class="mt-4 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div
						class="flex h-10 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
					>
						<span class="text-sm font-medium text-gray-700 dark:text-slate-300">Input JSON</span>
						<span class="text-xs text-gray-500 dark:text-slate-400">
							{#if inputJson.trim()}
								{inputJson.length.toLocaleString()} chars
							{:else}
								Paste or upload
							{/if}
						</span>
					</div>
					<div class="h-[400px]">
						<svelte:component
							this={JsonEditor}
							bind:value={inputJson}
							error={validationError}
							placeholder="Paste your JSON here..."
						/>
					</div>
				</div>

				<!-- Right Panel: Output -->
				<div
					class="mt-4 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div
						class="flex h-10 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
					>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors {rightPanelView ===
								'formatted'
									? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}"
								onclick={() => (rightPanelView = 'formatted')}
							>
								Formatted
							</button>
							<button
								type="button"
								class="cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed {rightPanelView ===
								'tree'
									? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}"
								onclick={() => (rightPanelView = 'tree')}
								disabled={!parsedData}
							>
								Tree View
							</button>
						</div>
						<!-- Status -->
						{#if !inputJson.trim()}
							<span class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
								<span class="h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-600"></span>
								Waiting
							</span>
						{:else if validationError}
							<span class="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
								<span class="h-2 w-2 rounded-full bg-red-500 dark:bg-red-600"></span>
								Invalid
							</span>
						{:else}
							<span
								class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
							>
								<span class="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-600"></span>
								Valid
							</span>
						{/if}
					</div>
					<div class="h-[400px]">
						{#if rightPanelView === 'formatted'}
							{#if outputJson}
								<svelte:component this={JsonEditor} value={outputJson} readonly placeholder="" />
							{:else}
								<div
									class="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400"
								>
									Formatted JSON will appear here
								</div>
							{/if}
						{:else if parsedData}
							<div class="h-full overflow-auto bg-white p-4 dark:bg-slate-800">
								<svelte:component this={JsonTreeView} data={parsedData} />
							</div>
						{:else}
							<div
								class="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400"
							>
								Tree view will appear here
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Stats Row -->
		{#if stats}
			<div class="mt-4 grid grid-cols-5 gap-3">
				<div
					class="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
						{stats.objects}
					</div>
					<div class="text-xs text-gray-500 dark:text-slate-400">Objects</div>
				</div>
				<div
					class="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="text-xl font-bold text-teal-600 dark:text-teal-400">{stats.arrays}</div>
					<div class="text-xs text-gray-500 dark:text-slate-400">Arrays</div>
				</div>
				<div
					class="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="text-xl font-bold text-cyan-600 dark:text-cyan-400">{stats.strings}</div>
					<div class="text-xs text-gray-500 dark:text-slate-400">Strings</div>
				</div>
				<div
					class="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.numbers}</div>
					<div class="text-xs text-gray-500 dark:text-slate-400">Numbers</div>
				</div>
				<div
					class="rounded-lg border border-gray-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-800"
				>
					<div class="text-xl font-bold text-gray-600 dark:text-slate-400">{stats.depth}</div>
					<div class="text-xs text-gray-500 dark:text-slate-400">Depth</div>
				</div>
			</div>
		{/if}

		<!-- Internal Upsell: JSON to TypeScript (only when valid) -->
		{#if isValid && parsedData}
			<div
				class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
			>
				<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
					<div class="flex-1">
						<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
							✨ Your JSON is valid!
						</h3>
						<p class="text-sm text-blue-700 dark:text-blue-400">
							Want to use this in TypeScript? Convert it to interfaces automatically.
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
						Convert to TypeScript
					</a>
				</div>
			</div>
		{/if}
	</section>

	<RelatedTools tool={currentTool} />

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
			title="Download: The Ultimate JSON Best Practices Cheat Sheet for API Developers"
			description="Master JSON formatting, validation, and API design patterns with this comprehensive guide."
			toolName="JSON Formatter & Validator"
			hookText="Developers often struggle with complex nested JSON structures. This guide ensures your APIs are cleaner, faster, and error-free with industry-standard practices."
			buttonText="Download Free JSON Guide"
		/>
	</div>

	<!-- Contextual CTA -->
	<div class="mt-10">
		<CTA
			title="Tired of debugging broken APIs?"
			description="Our backend engineers build robust, error-free API architectures (REST & GraphQL). Let Devxhub create scalable, secure APIs tailored to your business needs."
			buttonText="Hire Backend Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</article>
