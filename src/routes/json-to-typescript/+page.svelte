<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { onMount } from 'svelte';
	import PropertyEditor from './components/PropertyEditor.svelte';
	import Toolbar, { type OutputMode } from './components/Toolbar.svelte';
	import TsCodeViewer from './components/TsCodeViewer.svelte';
	import {
		copyToClipboard,
		downloadFile,
		generateTsFromInterfaces,
		parseJsonToInterfaces,
		type InterfaceInfo
	} from './components/utils';

	// Lazy load JsonEditor
	let JsonEditor = $state<
		typeof import('../json-formatter-validator/components/JsonEditor.svelte').default | null
	>(null);
	let componentsLoaded = $state(false);

	onMount(async () => {
		const EditorModule = await import('../json-formatter-validator/components/JsonEditor.svelte');
		JsonEditor = EditorModule.default;
		componentsLoaded = true;
	});

	// State
	let inputJson = $state('');
	let outputTs = $state('');
	let copySuccess = $state(false);
	let rightPanelView = $state<'code' | 'editor'>('code');
	let outputMode = $state<OutputMode>('interface');

	// Per-property optional map
	let optionalMap = $state<Record<string, boolean>>({});
	let interfaces = $state<InterfaceInfo[]>([]);

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Convert JSON to TypeScript Interfaces',
			steps: [
				{
					title: 'Paste Your JSON',
					description:
						'Copy your JSON from API responses, database queries, or configuration files and paste it into the left editor panel. The tool accepts both objects and arrays—if you paste an array, it will use the first item as the template.'
				},
				{
					title: 'Review Generated Types',
					description:
						'The tool automatically generates TypeScript interfaces or types with proper naming conventions. Nested objects become separate interfaces, and arrays are typed based on their contents (primitives, objects, or unions).'
				},
				{
					title: 'Customize Optional Properties',
					description:
						'Switch to the Editor view to toggle individual properties as optional (?) or required. You can also mark all properties as optional at once using the toolbar button—perfect for partial updates or PATCH requests.'
				},
				{
					title: 'Copy or Download',
					description:
						'Click Copy to add the TypeScript code to your clipboard, or Download to save it as a .ts file. The generated code is ready to use in your project with proper syntax and formatting.'
				}
			]
		},
		comparison: {
			title: 'Interface vs. Type Alias: Which Should You Use?',
			description:
				'This is a classic architectural debate in the TypeScript community. Both can define object shapes, but they have important differences that affect how you structure your code.',
			headers: ['Feature', 'Interface', 'Type Alias'],
			rows: [
				{
					label: 'Declaration Merging',
					columns: [
						'Yes - multiple declarations merge automatically',
						'No - duplicate declarations cause errors'
					]
				},
				{
					label: 'Extends/Implements',
					columns: ['Can extend and be implemented by classes', 'Can use intersections (&) instead']
				},
				{
					label: 'Union Types',
					columns: ['Cannot represent unions directly', 'Can represent unions, primitives, tuples']
				},
				{
					label: 'Best For',
					columns: [
						'API responses, data models, public APIs',
						'Unions, utility types, complex compositions'
					]
				}
			]
		},
		bestPractices: {
			title: 'TypeScript Type Definition Best Practices',
			practices: [
				"Use Interfaces for API responses: They're more extensible and provide clearer error messages when working with object shapes. Interfaces support declaration merging, making them ideal for library authors.",
				"Prefer readonly for immutable data: Add readonly to properties that shouldn't change after initialization to prevent accidental mutations and improve code safety.",
				'Avoid any type: Use unknown for truly unknown types, then narrow with type guards. The any type disables type checking entirely and defeats the purpose of TypeScript.',
				'Use strict null checks: Enable strictNullChecks in tsconfig.json to catch null/undefined errors at compile time instead of runtime crashes.',
				'Document complex types: Add JSDoc comments to explain non-obvious type decisions, especially for union types, generic constraints, or business logic.',
				'Keep types DRY: Extract common patterns into reusable utility types. Use Pick, Omit, Partial, and Required to derive types from existing ones instead of duplicating definitions.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: "What's the difference between Interface and Type in TypeScript?",
					answer:
						'Interfaces are better for defining object shapes and support declaration merging, making them ideal for public APIs and data models. They also provide clearer error messages. Types are more flexible and can represent unions, primitives, tuples, and complex compositions. For API responses, we recommend Interfaces. For unions or utility types, use Type aliases.'
				},
				{
					question: 'How does the tool handle nested objects and arrays?',
					answer:
						'The tool recursively analyzes your JSON structure and creates separate interfaces for nested objects. For example, if your JSON has an "address" object with "city" and "zip" properties, it generates an Address interface and references it in the parent type. Arrays are analyzed to determine if they contain primitives (string[]), objects (User[]), or mixed types ((string | number)[]).'
				},
				{
					question: 'Can I make all properties optional at once?',
					answer:
						'Yes! Use the "Mark All Optional" button in the toolbar to toggle all properties as optional (?). This is useful for PATCH endpoints, partial updates, or when working with incomplete data. You can also toggle individual properties in the Editor view for fine-grained control.'
				},
				{
					question: 'Why use Interfaces instead of Types for API responses?',
					answer:
						"Interfaces are generally recommended for API responses because they support declaration merging (you can extend them later), provide better error messages, and work better with object-oriented patterns. They're also more familiar to developers coming from other languages. Use Types when you need unions, intersections, or mapped types."
				},
				{
					question: 'Is my JSON data safe when using this tool?',
					answer:
						"Absolutely! All conversion happens entirely in your browser using JavaScript. Your JSON data never leaves your device—it's not sent to our servers, stored in any database, or transmitted over the internet. Your data remains completely private and secure."
				}
			]
		}
	};

	// Single effect to handle all reactive updates
	$effect(() => {
		const json = inputJson.trim();
		const optMap = optionalMap;
		const mode = outputMode;

		if (json) {
			const parsed = parseJsonToInterfaces(json, 'RootObject');
			interfaces = parsed;
			outputTs = generateTsFromInterfaces(parsed, optMap, mode);
		} else {
			interfaces = [];
			outputTs = '';
		}
	});

	function handleOptionalChange(path: string, value: boolean) {
		optionalMap = { ...optionalMap, [path]: value };
	}

	function markAllOptional(value: boolean) {
		const newMap: Record<string, boolean> = {};
		for (const iface of interfaces) {
			for (const prop of iface.properties) {
				newMap[prop.path] = value;
			}
		}
		optionalMap = newMap;
	}

	async function handleCopy() {
		if (!outputTs) return;
		const success = await copyToClipboard(outputTs);
		if (success) {
			copySuccess = true;
			setTimeout(() => (copySuccess = false), 2000);
		}
	}

	function handleDownload() {
		if (!outputTs) return;
		downloadFile(outputTs, 'types.ts', 'text/typescript');
	}

	function handleClear() {
		inputJson = '';
		optionalMap = {};
	}

	function handleOutputModeChange(value: OutputMode) {
		outputMode = value;
	}

	function loadSample() {
		inputJson = JSON.stringify(
			{
				id: 1,
				name: 'John Doe',
				email: 'john@example.com',
				address: {
					street: '123 Main St',
					city: 'New York'
				},
				tags: ['developer', 'svelte']
			},
			null,
			2
		);
	}

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'JSON to TypeScript Converter',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Convert JSON objects into TypeScript Interfaces or Types instantly. Handles nested objects, arrays, and optional properties. Save time writing manual type definitions.',
		featureList: [
			'JSON to TypeScript Conversion',
			'Interface Generation',
			'Type Alias Generation',
			'Nested Object Support',
			'Array Type Detection',
			'Per-Property Optional Control',
			'Syntax Highlighting',
			'Copy to Clipboard',
			'Download as .ts File',
			'Client-Side Processing',
			'No Data Storage',
			'Real-time Preview'
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

<article class="w-full space-y-4">
	<PageHeader
		title="Online JSON to TypeScript Converter"
		description="Convert JSON objects into TypeScript Interfaces or Types instantly. Handles nested objects, arrays, and optional properties automatically—all processing happens in your browser."
	/>

	<section aria-label="JSON to TypeScript interface">
		<!-- Toolbar -->
		<Toolbar
			{inputJson}
			{outputMode}
			{copySuccess}
			hasInterfaces={interfaces.length > 0}
			onOutputModeChange={handleOutputModeChange}
			onMarkAllOptional={markAllOptional}
			onLoadSample={loadSample}
			onClear={handleClear}
			onCopy={handleCopy}
			onDownload={handleDownload}
		/>

		{#if !componentsLoaded}
			<div
				class="mt-4 flex h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
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
			<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<!-- Left Panel: Input -->
				<div
					class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div
						class="flex h-10 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
					>
						<span class="text-sm font-medium text-gray-700 dark:text-slate-300">Input JSON</span>
						<span class="text-xs text-gray-500 dark:text-slate-400">
							{#if inputJson.trim()}
								{inputJson.length.toLocaleString()} chars
							{:else}
								Paste JSON here
							{/if}
						</span>
					</div>
					<div class="h-[400px]">
						{#if JsonEditor}
							<JsonEditor bind:value={inputJson} placeholder="Paste your JSON here..." />
						{/if}
					</div>
				</div>

				<!-- Right Panel: Output -->
				<div
					class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<div
						class="flex h-10 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
					>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors {rightPanelView ===
								'code'
									? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}"
								onclick={() => (rightPanelView = 'code')}
							>
								Code
							</button>
							<button
								type="button"
								class="cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed {rightPanelView ===
								'editor'
									? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-400'
									: 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}"
								onclick={() => (rightPanelView = 'editor')}
								disabled={interfaces.length === 0}
							>
								Editor
							</button>
						</div>
						<!-- Status -->
						{#if !inputJson.trim()}
							<span class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
								<span class="h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-600"></span>
								Waiting
							</span>
						{:else if interfaces.length === 0}
							<span class="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
								<span class="h-2 w-2 rounded-full bg-red-500 dark:bg-red-600"></span>
								Invalid JSON
							</span>
						{:else}
							<span
								class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
							>
								<span class="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-600"></span>
								{interfaces.length}
								{outputMode}{interfaces.length > 1 ? 's' : ''}
							</span>
						{/if}
					</div>
					<div class="h-[400px]">
						{#if rightPanelView === 'code'}
							<TsCodeViewer code={outputTs} placeholder="TypeScript will appear here" />
						{:else}
							<PropertyEditor
								{interfaces}
								{optionalMap}
								{outputMode}
								onOptionalChange={handleOptionalChange}
							/>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- Internal Linking - Fake Data Generator Upsell -->
	<div
		class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
	>
		<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
					🎲 Need more test data for this interface?
				</h3>
				<p class="text-sm text-blue-700 dark:text-blue-400">
					Use our Fake Data Generator to populate your UI with realistic mock data.
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
				Generate Test Data
			</a>
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

	<div class="mt-10">
		<LeadMagnetInline
			title="TypeScript Essentials: From JSON to Type-Safe Code"
			description="Master TypeScript interfaces, types, and best practices for API development."
			toolName="JSON to TypeScript"
			hookText="Stop writing types manually. Learn how to leverage TypeScript's type system for safer, more maintainable code."
			buttonText="Download Free TypeScript Guide"
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Scaling a Large TypeScript Codebase?"
			description="Strict type safety prevents bugs, but it requires architectural discipline. Our senior engineers build scalable, type-safe frontends with proper patterns and best practices."
			buttonText="Hire TypeScript Experts"
			buttonUrl="https://www.devxhub.com/full-stack-development"
			buttonAriaLabel="Hire TypeScript Experts"
		/>
	</div>
</article>
