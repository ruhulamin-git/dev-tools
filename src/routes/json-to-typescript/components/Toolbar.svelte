<script lang="ts">
	export type OutputMode = 'interface' | 'type';

	interface Props {
		inputJson: string;
		hasInterfaces: boolean;
		outputMode: OutputMode;
		copySuccess: boolean;
		onOutputModeChange: (value: OutputMode) => void;
		onMarkAllOptional: (value: boolean) => void;
		onLoadSample: () => void;
		onClear: () => void;
		onCopy: () => void;
		onDownload: () => void;
	}

	let {
		inputJson,
		hasInterfaces,
		outputMode,
		copySuccess,
		onOutputModeChange,
		onMarkAllOptional,
		onLoadSample,
		onClear,
		onCopy,
		onDownload
	}: Props = $props();
</script>

<div
	class="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
>
	<!-- Sample Button -->
	<button
		onclick={onLoadSample}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 10V3L4 14h7v7l9-11h-7z"
			/>
		</svg>
		Sample
	</button>

	<div class="h-6 w-px bg-gray-200 dark:bg-slate-600"></div>

	<!-- Output Mode Toggle -->
	<div
		class="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-slate-600 dark:bg-slate-700"
	>
		<button
			type="button"
			onclick={() => onOutputModeChange('interface')}
			class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors {outputMode ===
			'interface'
				? 'bg-white text-blue-700 shadow-sm dark:bg-slate-600 dark:text-blue-400'
				: 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}"
		>
			Interface
		</button>
		<button
			type="button"
			onclick={() => onOutputModeChange('type')}
			class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors {outputMode ===
			'type'
				? 'bg-white text-blue-700 shadow-sm dark:bg-slate-600 dark:text-blue-400'
				: 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'}"
		>
			Type
		</button>
	</div>

	<div class="h-6 w-px bg-gray-200 dark:bg-slate-600"></div>

	<!-- All Optional / Required -->
	<button
		onclick={() => onMarkAllOptional(true)}
		disabled={!hasInterfaces}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
	>
		All Optional
	</button>
	<button
		onclick={() => onMarkAllOptional(false)}
		disabled={!hasInterfaces}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
	>
		All Required
	</button>

	<div class="h-6 w-px bg-gray-200 dark:bg-slate-600"></div>

	<!-- Copy Button -->
	<button
		onclick={onCopy}
		disabled={!hasInterfaces}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 {copySuccess
			? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
			: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
	>
		{#if copySuccess}
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			Copied!
		{:else}
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
				/>
			</svg>
			Copy
		{/if}
	</button>

	<!-- Download Button -->
	<button
		onclick={onDownload}
		disabled={!hasInterfaces}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
			/>
		</svg>
		.ts
	</button>

	<div class="flex-1"></div>

	<!-- Clear Button -->
	<button
		onclick={onClear}
		disabled={!inputJson}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
		aria-label="Clear input"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
			/>
		</svg>
	</button>
</div>
