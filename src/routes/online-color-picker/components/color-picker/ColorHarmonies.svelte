<script lang="ts">
	import { base } from '$app/paths';
	import { Copy } from '$lib/shared/icons';
	import { hexToRgb } from '$lib/shared/utils';

	interface Props {
		analogousColors: string[];
		selectedColor: string;
		onSelectColor: (hex: string) => void;
	}

	let { analogousColors, selectedColor, onSelectColor }: Props = $props();

	function updateColorFromHex(color: string) {
		const newRgb = hexToRgb(color);
		const r = newRgb.r / 255;
		const g = newRgb.g / 255;
		const b = newRgb.b / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;

		let hue = 0;
		let saturationValue = max === 0 ? 0 : Math.round((d / max) * 100);
		let brightnessValue = Math.round(max * 100);

		if (d !== 0) {
			let h = 0;
			switch (max) {
				case r:
					h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
					break;
				case g:
					h = ((b - r) / d + 2) / 6;
					break;
				case b:
					h = ((r - g) / d + 4) / 6;
					break;
			}
			hue = Math.round(h * 360);
		}

		return { hue, saturationValue, brightnessValue };
	}
</script>

<section aria-labelledby="harmonies-heading">
	<div class="my-5 flex items-center justify-between">
		<h2 id="harmonies-heading" class="text-lg font-bold text-white">
			Color Harmonies
		</h2>
		<a
			href="{base}/online-color-picker/palette"
			class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
		>
			View All Palettes →
		</a>
	</div>
	<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
		{#each analogousColors as color, i}
			<button class="group flex cursor-pointer flex-col gap-2" onclick={() => onSelectColor(color)}>
				<div
					class="relative aspect-square overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md md:aspect-video {i ===
					2
						? 'ring-2 ring-blue-500 ring-offset-2'
						: ''}"
					style="background-color: {color};"
				>
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100"
					>
						<Copy class="h-5 w-5 text-white drop-shadow-md" />
					</div>
					{#if i === 2}
						<div
							class="absolute top-2 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 shadow-sm"
						>
							ACTIVE
						</div>
					{/if}
				</div>
				<div class="flex items-center justify-between px-1">
					<span class="font-mono text-sm font-medium text-white"
						>{color}</span
					>
					{#if i === 2}
						<span class="text-xs text-slate-100 dark:text-slate-100">Base</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</section>
