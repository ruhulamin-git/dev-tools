<script lang="ts">
	import { Card } from '$lib/shared/components';
	import { Copy, Check } from '$lib/shared/icons';

	interface Props {
		selectedColor: string;
		alpha: number;
		copiedField: string | null;
		onCopy: () => void;
	}

	let { selectedColor, alpha, copiedField, onCopy }: Props = $props();
</script>

<Card class="flex items-center justify-between p-4">
	<div class="flex items-center gap-4">
		<div
			class="h-12 w-12 rounded-lg shadow-inner ring-1 ring-black/5"
			style="background-color: {selectedColor}; opacity: {alpha};"
		></div>
		<div class="flex flex-col">
			<span class="text-xs font-medium text-slate-500 uppercase dark:text-slate-400">Selected</span>
			<span class="font-mono text-lg font-bold text-white"
				>{selectedColor}</span
			>
			{#if alpha < 1}
				<span class="font-mono text-xs text-slate-500 dark:text-slate-400"
					>α: {Math.round(alpha * 100)}%</span
				>
			{/if}
		</div>
	</div>
	<button
		class="cursor-pointer p-1 text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
		onclick={onCopy}
		aria-label="Copy HEX value"
	>
		{#if copiedField === 'main'}
			<Check class="h-5 w-5 text-green-500" />
		{:else}
			<Copy class="h-5 w-5" />
		{/if}
	</button>
</Card>
