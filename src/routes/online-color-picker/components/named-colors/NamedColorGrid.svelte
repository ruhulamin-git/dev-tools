<script lang="ts">
	import { Copy, Check } from '$lib/shared/icons';

	interface NamedColor {
		name: string;
		hex: string;
		rgb: string;
		family: string;
	}

	interface Props {
		colors: NamedColor[];
		copiedField: string | null;
		onCopyColor: (hex: string) => void;
	}

	let { colors, copiedField, onCopyColor }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
	{#each colors as color}
		<button
			class="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
			onclick={() => onCopyColor(color.hex)}
		>
			<div class="relative h-24 w-full" style="background-color: {color.hex};">
				<div
					class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100"
				>
					{#if copiedField === color.hex}
						<Check class="h-6 w-6 text-white drop-shadow-md" />
					{:else}
						<Copy class="h-6 w-6 text-white drop-shadow-md" />
					{/if}
				</div>
			</div>
			<div class="flex flex-col gap-1 p-3">
				<span class="truncate text-sm font-bold text-white"
					>{color.name}</span
				>
				<div class="flex flex-col gap-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
					<span class="uppercase">{color.hex}</span>
					<span class="opacity-60">{color.rgb}</span>
				</div>
			</div>
		</button>
	{/each}
</div>
