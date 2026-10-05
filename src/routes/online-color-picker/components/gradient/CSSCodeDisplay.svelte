<script lang="ts">
	import { Card } from '$lib/shared/components';
	import { Copy, Check } from '$lib/shared/icons';

	interface Props {
		gradientCSS: string;
		copiedField: string | null;
		onCopyCSS: () => void;
	}

	let { gradientCSS, copiedField, onCopyCSS }: Props = $props();
</script>

<Card class="overflow-hidden">
	<div
		class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-900/50"
	>
		<h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">CSS Code</h2>
	</div>
	<div class="flex flex-col gap-3 p-4">
		<div class="group relative rounded-lg bg-slate-900 p-3">
			<code class="block font-mono text-xs leading-relaxed break-all text-slate-300">
				background: {gradientCSS};
			</code>
		</div>
		<button
			class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
			onclick={onCopyCSS}
		>
			{#if copiedField === 'css'}
				<Check class="h-4 w-4" />
				Copied!
			{:else}
				<Copy class="h-4 w-4" />
				Copy to Clipboard
			{/if}
		</button>
	</div>
</Card>
