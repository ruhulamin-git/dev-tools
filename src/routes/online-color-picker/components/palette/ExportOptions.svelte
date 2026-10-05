<script lang="ts">
	import { Card } from '$lib/shared/components';
	import { Copy, Check } from '$lib/shared/icons';

	interface Props {
		palette: string[];
		copiedField: string | null;
		onExportCSS: () => void;
		onExportJSON: () => void;
	}

	let { palette, copiedField, onExportCSS, onExportJSON }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-5">
	<!-- CSS Variables -->
	<Card class="p-4">
		<button
			class="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
			onclick={onExportCSS}
		>
			<div class="flex items-center gap-3">
				<span class="text-2xl">🎨</span>
				<div class="flex flex-col items-start">
					<span class="text-sm font-bold text-white">CSS Variables</span>
					<span class="text-xs text-slate-500 dark:text-slate-400">:root {'{ --color... }'}</span>
				</div>
			</div>
			{#if copiedField === 'css'}
				<Check class="h-5 w-5 text-green-500" />
			{:else}
				<Copy class="h-5 w-5 text-slate-400" />
			{/if}
		</button>
	</Card>

	<!-- JSON -->
	<Card class="p-4">
		<button
			class="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
			onclick={onExportJSON}
		>
			<div class="flex items-center gap-3">
				<span class="text-2xl">📋</span>
				<div class="flex flex-col items-start">
					<span class="text-sm font-bold text-white">JSON</span>
					<span class="text-xs text-slate-500 dark:text-slate-400">["{palette[0]}", ...]</span>
				</div>
			</div>
			{#if copiedField === 'json'}
				<Check class="h-5 w-5 text-green-500" />
			{:else}
				<Copy class="h-5 w-5 text-slate-400" />
			{/if}
		</button>
	</Card>

	<!-- Back to Picker -->
	<Card class="p-4">
		<a
			href="/"
			class="group flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
		>
			<div class="flex items-center gap-3">
				<span class="text-2xl">🔙</span>
				<div class="flex flex-col items-start">
					<span class="text-sm font-bold text-white">Color Picker</span>
					<span class="text-xs text-slate-500 dark:text-slate-400">Back to main tool</span>
				</div>
			</div>
			<span class="text-slate-400 dark:text-slate-500">→</span>
		</a>
	</Card>
</div>
