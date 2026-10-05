<script lang="ts">
	import { Copy, Check } from '$lib/shared/icons';

	interface Props {
		title: string;
		colors: string[];
		baseColor: string;
		format: 'hex' | 'rgb' | 'hsl';
		copiedField: string | null;
		formatColor: (hex: string, fmt: 'hex' | 'rgb' | 'hsl') => string;
		getPercentage: (index: number, total: number, isTint: boolean) => number;
		onCopyColor: (color: string) => void;
		onCopyAll: () => void;
		isTint?: boolean;
	}

	let {
		title,
		colors,
		baseColor,
		format,
		copiedField,
		formatColor,
		getPercentage,
		onCopyColor,
		onCopyAll,
		isTint = false
	}: Props = $props();
</script>

<section class="my-5 flex flex-col gap-5" aria-labelledby="{title.toLowerCase()}-heading">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="rounded-lg border border-slate-200 bg-white p-2 text-blue-600 shadow-sm dark:border-slate-700 dark:bg-slate-800"
			>
				{isTint ? '☀️' : '🌙'}
			</div>
			<h2
				id="{title.toLowerCase()}-heading"
				class="text-lg font-bold text-white"
			>
				{title}
			</h2>
		</div>
		<button
			class="flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
			onclick={onCopyAll}
		>
			<Copy class="h-4 w-4" />
			{copiedField === `all${title}` ? 'Copied!' : 'Copy All'}
		</button>
	</div>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
		{#each colors as color, i}
			<button
				class="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
				onclick={() => onCopyColor(color)}
			>
				<div class="relative h-24 w-full" style="background-color: {color};">
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100"
					>
						{#if copiedField === color}
							<Check class="h-5 w-5 text-white drop-shadow-md" />
						{:else}
							<Copy class="h-5 w-5 text-white drop-shadow-md" />
						{/if}
					</div>
				</div>
				<div class="flex flex-col gap-1 p-3">
					<span class="truncate font-mono text-xs font-bold text-white"
						>{formatColor(color, format)}</span
					>
					<span class="text-[10px] font-bold text-slate-500 dark:text-slate-400"
						>{getPercentage(i, colors.length, isTint)}%</span
					>
				</div>
			</button>
		{/each}

		<!-- Base Color Card -->
		<button
			class="group cursor-pointer overflow-hidden rounded-xl border-2 border-blue-500 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-800"
			onclick={() => onCopyColor(baseColor)}
		>
			<div class="relative h-24 w-full" style="background-color: {baseColor};">
				<div
					class="absolute top-2 right-2 z-10 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 shadow-sm dark:bg-slate-700/90 dark:text-blue-400"
				>
					BASE
				</div>
				<div
					class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100"
				>
					{#if copiedField === baseColor}
						<Check class="h-5 w-5 text-white drop-shadow-md" />
					{:else}
						<Copy class="h-5 w-5 text-white drop-shadow-md" />
					{/if}
				</div>
			</div>
			<div class="flex flex-col gap-1 bg-blue-50 p-3 dark:bg-blue-900/30">
				<span class="truncate font-mono text-xs font-bold text-white"
					>{formatColor(baseColor, format)}</span
				>
				<span class="text-[10px] font-bold text-blue-600 dark:text-blue-400">0%</span>
			</div>
		</button>
	</div>
</section>
