<script lang="ts">
	import { base } from '$app/paths';
	import { CTA, JsonLd } from '$lib/shared/components';
	import {
		getCategories,
		getLiveTools,
		getToolBySlug,
		getToolUrl,
		type Tool,
		type ToolCategory
	} from '$lib/shared/config/tools';
	import { getRecentToolSlugs } from '$lib/shared/utils/recentTools';
	import { fade } from 'svelte/transition';

	// State
	let searchQuery = $state('');
	let activeCategory = $state<ToolCategory | 'all'>('all');
	// getRecentToolSlugs() itself returns [] when window is undefined, so this $derived is
	// correctly empty during SSR/prerendering (no visitor to personalize for) and, since Svelte
	// re-runs a component's initializer on the client during hydration, picks up the real
	// localStorage-backed value on first client render.
	const recentToolSlugs = $derived(getRecentToolSlugs());

	// Recognition over recall, and the endowment effect: a returning visitor sees their own
	// tools first rather than the same generic grid every time.
	const recentTools = $derived(
		recentToolSlugs.map((slug) => getToolBySlug(slug)).filter((t): t is Tool => t !== undefined)
	);

	// Data
	const allTools = getLiveTools().sort((a, b) => a.priority - b.priority);

	// The tool registry is trusted, local config today, but building this schema as a plain
	// object — rather than string-templating each tool's name and URL into a JSON.stringify'd
	// script tag by hand — means it goes through JsonLd's escaping unconditionally, so it stays
	// safe even if tool data ever comes from somewhere less trusted.
	const collectionPageSchema = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Devxhub Developer Tools',
		description:
			'Free privacy-focused tools for developers including JSON Formatter, JWT Decoder, and more.',
		url: 'https://www.devxhub.com/tools',
		hasPart: allTools.map((tool) => ({
			'@type': 'SoftwareApplication',
			name: tool.name,
			url: `https://www.devxhub.com${getToolUrl(tool, '')}`
		}))
	};
	const categories = getCategories();

	// Derived
	let filteredTools = $derived.by(() => {
		let tools = allTools;

		// Filter by category
		if (activeCategory !== 'all') {
			tools = tools.filter((t) => t.category === activeCategory);
		}

		// Filter by search
		const query = searchQuery.toLowerCase().trim();
		if (query) {
			tools = tools.filter(
				(t) =>
					t.name.toLowerCase().includes(query) ||
					t.shortDescription.toLowerCase().includes(query) ||
					t.keywords?.some((k) => k.toLowerCase().includes(query))
			);
		}

		return tools;
	});

	let groupedTools = $derived.by(() => {
		const groups: Record<string, Tool[]> = {};

		if (activeCategory !== 'all' || searchQuery) {
			// specific view: just one group "Results"
			groups['Results'] = filteredTools;
		} else {
			// Default view: grouped by category
			categories.forEach((cat) => {
				const catTools = allTools.filter((t) => t.category === cat);
				if (catTools.length > 0) {
					groups[cat] = catTools;
				}
			});
		}
		return groups;
	});

	function getCategoryIcon(category: string) {
		const iconPath = (() => {
			switch (category) {
				case 'developer':
					return '/category-icons/developer.png';
				case 'text':
					return '/category-icons/text.png';
				case 'image':
					return '/category-icons/image.png';
				case 'productivity':
					return '/category-icons/productivity.png';
				case 'all':
					return '/category-icons/all.png';
				default:
					return '/category-icons/developer.png';
			}
		})();
		return `${base}${iconPath}`;
	}

	function getCategoryLabel(category: string) {
		const labels: Record<string, string> = {
			developer: 'Developer & Backend Tools',
			text: 'Text Manipulation & Editing',
			image: 'Image Optimization & Color',
			productivity: 'Productivity & Daily Utilities'
		};
		return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
	}

	function getCategoryDescription(category: string) {
		const descriptions: Record<string, string> = {
			developer: 'Debug, format, and secure your code with client-side utilities.',
			text: 'Parse, compare, and clean text formats instantly.',
			image: 'Optimize assets and define styles for web projects.',
			productivity: 'Simple tools to manage tasks and time.'
		};
		return descriptions[category] || '';
	}

	function getAssetPath(path: string) {
		return `${base}${path}`;
	}
</script>

<svelte:head>
	<title>Free Developer Tools & Web Utilities (Privacy-Focused) - Devxhub</title>
	<meta
		name="description"
		content="A collection of 20+ free online tools for developers, designers, and creators. Includes JSON Formatter, JWT Decoder, Image Tools, and more. 100% client-side security."
	/>
	<meta
		name="keywords"
		content="free developer tools, online web utilities, privacy-focused tools, client-side tools, json formatter, jwt decoder, image compressor, developer utilities"
	/>

	<JsonLd data={collectionPageSchema} />
</svelte:head>

<div class="">
	<!-- Hero Section -->
	<section class="py-16 text-center lg:py-20">
		<h1 class="primary-h-tag mb-6">
			<span class="text-gradient">The Essential Toolkit for Modern Developers</span>
		</h1>
		<p class="primary-p-tag mx-auto mb-10 max-w-2xl md:mb-12">
			Free, fast, and privacy-first utilities. Process data locally in your browser without sending
			it to a server. No ads, no tracking, just code.
		</p>

		<!-- Search Bar -->
		<div class="relative mx-auto max-w-lg">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				<svg
					class="h-5 w-5 text-slate-400"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search tools (e.g., 'JSON', 'Color', 'Invoice')..."
				aria-label="Search tools"
				class="block w-full rounded-2xl border-0 bg-white py-4 pr-4 pl-12 text-slate-900 shadow-xl ring-1 ring-slate-900/5 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-300 dark:focus:ring-blue-400"
			/>
		</div>

		<!-- Category Filters -->
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<button
				onclick={() => (activeCategory = 'all')}
				class="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all {activeCategory ===
				'all'
					? 'bg-blue-600 text-white shadow-lg'
					: 'bg-slate-700 text-slate-100 hover:bg-slate-600'}"
			>
				<img src={getCategoryIcon('all')} alt="" class="h-5 w-5 object-contain" />
				All
			</button>
			{#each categories as category}
				<button
					onclick={() => (activeCategory = category)}
					class="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all {activeCategory ===
					category
						? 'bg-blue-600 text-white shadow-lg'
						: 'bg-slate-700 text-slate-100 hover:bg-slate-600'}"
				>
					<img src={getCategoryIcon(category)} alt="" class="h-5 w-5 object-contain" />
					{getCategoryLabel(category)}
				</button>
			{/each}
		</div>
	</section>

	{#if recentTools.length > 0}
		<section class="mb-12" aria-label="Recently used tools">
			<div class="mb-4 flex items-center gap-2">
				<svg
					class="h-5 w-5 text-devx-yellow"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h2 class="text-lg font-semibold text-slate-100">Continue where you left off</h2>
			</div>
			<div class="flex gap-3 overflow-x-auto pb-2">
				{#each recentTools as tool (tool.slug)}
					<a
						href={getToolUrl(tool, base)}
						class="flex shrink-0 items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-2 pr-4 pl-2 text-sm font-medium text-slate-100 transition-colors hover:border-devx-yellow/40 hover:bg-slate-700"
					>
						<img src={getAssetPath(tool.icon || '')} alt="" class="h-6 w-6 object-contain" />
						{tool.name}
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Tools Grid -->
	<div>
		{#each Object.entries(groupedTools) as [groupName, tools] (groupName)}
			{#if tools.length > 0}
				<div class="mb-12" in:fade={{ duration: 300 }}>
					{#if !searchQuery && activeCategory === 'all'}
						<div class="mb-6">
							<div class="flex items-center gap-3 border-b border-slate-700 pb-2">
								<img
									src={getCategoryIcon(groupName)}
									alt={groupName}
									class="h-8 w-8 object-contain"
								/>
								<h2 class="text-xl font-bold text-slate-100">
									{getCategoryLabel(groupName)}
								</h2>
								<span
									class="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300"
								>
									{tools.length}
								</span>
							</div>
							<p class="mt-2 text-sm text-slate-400">
								{getCategoryDescription(groupName)}
							</p>
						</div>
					{/if}

					<div
						class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
						data-sveltekit-preload-data="hover"
					>
						{#each tools as tool (tool.slug)}
							<a
								href={getToolUrl(tool, base)}
								class="group relative flex transform-gpu flex-col overflow-hidden
							rounded-2xl bg-slate-800 p-6 shadow-sm ring-1
							ring-slate-700 transition-shadow transition-transform
							duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
							hover:-translate-y-0.5 hover:no-underline
							hover:shadow-lg hover:shadow-blue-500/10"
								style="text-decoration: none !important;"
							>
								<div class="mb-4 flex items-center justify-between">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-xl
									bg-slate-700/50 text-2xl
									transition-colors duration-500 ease-out
									group-hover:bg-blue-900/20"
									>
										{#if tool.icon}
											<img
												src={getAssetPath(tool.icon)}
												alt={tool.name}
												class="h-8 w-8 object-contain
											transition-transform duration-500 ease-out
											group-hover:scale-105"
												loading="lazy"
											/>
										{:else}
											<img
												src={getCategoryIcon(tool.category)}
												alt={tool.category}
												class="h-8 w-8 object-contain opacity-50 grayscale"
											/>
										{/if}
									</div>
									<div
										class="text-slate-500 transition-colors duration-500 ease-out group-hover:text-blue-400"
									>
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M14 5l7 7m0 0l-7 7m7-7H3"
											/>
										</svg>
									</div>
								</div>

								<h3 class="mb-2 text-lg font-bold text-slate-100">
									{tool.name}
								</h3>
								<p class="line-clamp-2 text-sm leading-relaxed text-slate-300">
									{tool.shortDescription}
								</p>

								<!-- Smooth Hover Ring -->
								<div
									class="absolute inset-0 rounded-2xl ring-2 ring-transparent
								transition-[box-shadow,ring-color] duration-400 ease-out
								group-hover:ring-blue-500/20"
								></div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{/each}

		{#if filteredTools.length === 0}
			<div class="py-20 text-center">
				<div class="mb-4 text-4xl">🔍</div>
				<h3 class="mb-2 text-lg font-medium text-slate-100">No tools found</h3>
				<p class="text-slate-300">
					We couldn't find any tools matching "{searchQuery}". Try a different keyword.
				</p>
				<button
					onclick={() => {
						searchQuery = '';
						activeCategory = 'all';
					}}
					class="mt-6 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
				>
					Clear search
				</button>
			</div>
		{/if}
	</div>

	<!-- SEO Content Section -->
	<section class="mt-20 mb-16">
		<div class="space-y-12">
			<!-- Why Use Devxhub Tools -->
			<div>
				<h2 class="mb-6 text-3xl font-bold text-slate-100">Why Use Devxhub Tools?</h2>
				<div class="space-y-6">
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-3 text-lg font-semibold text-blue-400">🔒 Privacy First</h3>
						<p class="leading-relaxed text-slate-300">
							Unlike other sites that upload your data to a server to process it, our tools run 100%
							in your browser (Client-side). Your JSON, passwords, and images never leave your
							device.
						</p>
					</div>
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-3 text-lg font-semibold text-blue-400">🚫 No Ads, No Clutter</h3>
						<p class="leading-relaxed text-slate-300">
							We are a software agency, not an ad farm. We built these tools because we use them
							ourselves every day. Clean interface, zero distractions.
						</p>
					</div>
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-3 text-lg font-semibold text-blue-400">⚡ Fast & Modern</h3>
						<p class="leading-relaxed text-slate-300">
							Built with the latest web technologies for instant performance, even offline. No
							loading spinners, no waiting—just instant results.
						</p>
					</div>
				</div>
			</div>

			<!-- Popular Categories -->
			<div>
				<h2 class="mb-6 text-3xl font-bold text-slate-100">Popular Categories</h2>
				<div class="grid gap-6 md:grid-cols-2">
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-2 text-lg font-semibold text-slate-100">📊 Data Formatting</h3>
						<p class="leading-relaxed text-slate-300">
							Clean up messy JSON, XML, or HTML for easier debugging. Validate syntax and beautify
							code instantly.
						</p>
					</div>
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-2 text-lg font-semibold text-slate-100">🔐 Security</h3>
						<p class="leading-relaxed text-slate-300">
							Generate strong passwords, hash sensitive data, and decode JWT tokens securely—all in
							your browser.
						</p>
					</div>
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-2 text-lg font-semibold text-slate-100">🔄 Converters</h3>
						<p class="leading-relaxed text-slate-300">
							Switch between timestamps, date formats, and number bases (Hex/Binary) instantly. No
							more manual calculations.
						</p>
					</div>
					<div class="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
						<h3 class="mb-2 text-lg font-semibold text-slate-100">🎨 Design Tools</h3>
						<p class="leading-relaxed text-slate-300">
							Optimize images, pick colors, and generate placeholder text for your design mockups
							and prototypes.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
	<div class="mt-10">
		<CTA
			title="Built by Developers, For Developers"
			description="These tools showcase just a fraction of what our team can do. Need a custom enterprise platform, mobile app, or AI solution?"
			buttonText="Hire Our Developers"
			buttonUrl="https://www.devxhub.com/services"
			secondaryButtonText="View Case Studies"
			secondaryButtonUrl="https://www.devxhub.com/case-study"
		/>
	</div>
</div>

<style>
	/* Override global link hover effects for tool cards */
	:global(.group:hover) {
		text-decoration: none !important;
	}

	:global(.group a:hover) {
		text-decoration: none !important;
	}

	/* Ensure tool card links don't get underlined */
	:global(a.group:hover) {
		text-decoration: none !important;
		color: inherit !important;
	}
</style>
