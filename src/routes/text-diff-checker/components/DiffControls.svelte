<script lang="ts">
	import type { DiffOptions } from './types';

	interface Props {
		options: DiffOptions;
		onOptionsChange: (options: DiffOptions) => void;
		onClear: () => void;
		hasContent: boolean;
		showViewToggle?: boolean;
	}

	let { options, onOptionsChange, onClear, hasContent, showViewToggle = false }: Props = $props();

	function updateOption<K extends keyof DiffOptions>(key: K, value: DiffOptions[K]) {
		onOptionsChange({ ...options, [key]: value });
	}
</script>

<div
	class="flex flex-col items-stretch gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-white p-3 sm:p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50"
>
	<!-- Options -->
	<div class="flex flex-wrap items-center gap-2 sm:gap-3">
		<!-- View Mode Toggle (only show when results are visible) -->
		{#if showViewToggle}
			<div class="flex items-center rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
				<button
					type="button"
					onclick={() => updateOption('viewMode', 'unified')}
					class="flex items-center gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-xs font-medium transition-all {options.viewMode ===
					'unified'
						? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
						: 'text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-600/50 dark:hover:text-slate-100'}"
					aria-pressed={options.viewMode === 'unified'}
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
					<span class="hidden sm:inline">Unified</span>
				</button>
				<button
					type="button"
					onclick={() => updateOption('viewMode', 'side-by-side')}
					class="flex items-center gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-xs font-medium transition-all {options.viewMode ===
					'side-by-side'
						? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
						: 'text-slate-600 hover:bg-white/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-600/50 dark:hover:text-slate-100'}"
					aria-pressed={options.viewMode === 'side-by-side'}
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
						/>
					</svg>
					<span class="hidden sm:inline">Side by Side</span>
				</button>
			</div>
			<div class="hidden h-6 w-px bg-slate-200 dark:bg-slate-600 sm:block"></div>
		{/if}

		<!-- Ignore Whitespace -->
		<!-- Ignore Whitespace -->
		<button
			type="button"
			onclick={() => updateOption('ignoreWhitespace', !options.ignoreWhitespace)}
			class="group flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all {options.ignoreWhitespace
				? 'border-slate-900 bg-slate-900 text-white shadow-sm hover:border-slate-800 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500'
				: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
			aria-pressed={options.ignoreWhitespace}
		>
			<svg
				class="h-4 w-4 {options.ignoreWhitespace ? 'text-white' : 'text-slate-400'}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16m-7 6h7"
				/>
			</svg>
			<span class="hidden sm:inline">Ignore Spaces</span>
			{#if options.ignoreWhitespace}
				<svg class="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>

		<!-- Character Diff -->
		<!-- Character Diff -->
		<button
			type="button"
			onclick={() => updateOption('characterLevelDiff', !options.characterLevelDiff)}
			class="group flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-all {options.characterLevelDiff
				? 'border-slate-900 bg-slate-900 text-white shadow-sm hover:border-slate-800 hover:bg-slate-800 dark:border-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500'
				: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
			aria-pressed={options.characterLevelDiff}
		>
			<svg
				class="h-4 w-4 {options.characterLevelDiff ? 'text-white' : 'text-slate-400'}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
				/>
			</svg>
			<span class="hidden sm:inline">Char Diff</span>
			{#if options.characterLevelDiff}
				<svg class="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
	</div>

	<!-- Clear Action -->
	{#if hasContent}
		<button
			type="button"
			onclick={onClear}
			class="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-600 transition-all hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
			<span class="hidden sm:inline">Clear All</span>
		</button>
	{/if}
</div>
