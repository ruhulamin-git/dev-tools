<script lang="ts">
	import { Copy, Check } from '$lib/shared/icons';
	import { hexToRgb } from '$lib/shared/utils';

	interface Props {
		palette: string[];
		baseColor: string;
		copiedField: string | null;
		onCopyColor: (color: string) => void;
		onCopyAll: () => void;
	}

	let { palette, baseColor, copiedField, onCopyColor, onCopyAll }: Props = $props();
</script>

<section aria-labelledby="palette-heading">
	<div class="my-5 flex items-center justify-between">
		<h2 id="palette-heading" class="text-lg font-bold text-white">
			Generated Palette
		</h2>
		<div class="flex gap-2">
			<button
				class="flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
				onclick={onCopyAll}
			>
				<Copy class="h-4 w-4" />
				{copiedField === 'all' ? 'Copied!' : 'Copy All'}
			</button>
		</div>
	</div>

	<!-- Large Palette Display -->
	<div
		class="flex h-64 w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200 lg:h-80 dark:ring-slate-700"
	>
		{#each palette as color, i}
			<button
				class="group relative flex flex-1 flex-col justify-end p-4 transition-[flex] duration-300 hover:flex-[1.5]"
				style="background-color: {color};"
				onclick={() => onCopyColor(color)}
			>
				{#if color === baseColor}
					<div
						class="absolute top-4 right-4 rounded bg-white/20 px-2 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-md"
					>
						Base
					</div>
				{/if}
				<div
					class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
					>
						{#if copiedField === color}
							<Check class="h-5 w-5" />
						{:else}
							<Copy class="h-5 w-5" />
						{/if}
					</div>
				</div>
				<div
					class="flex translate-y-2 flex-col gap-0.5 rounded-lg bg-black/20 p-3 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
				>
					<span class="font-mono text-lg font-bold text-white uppercase">{color}</span>
					<span class="text-xs text-white/80">Color {i + 1}</span>
					<span class="mt-1 text-[10px] text-white/60">
						RGB: {hexToRgb(color).r}, {hexToRgb(color).g}, {hexToRgb(color).b}
					</span>
				</div>
			</button>
		{/each}
	</div>
</section>
