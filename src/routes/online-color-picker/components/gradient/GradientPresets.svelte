<script lang="ts">
	import { Card } from '$lib/shared/components';

	interface Preset {
		colors: string[];
		angle: number;
	}

	interface Props {
		presets: Preset[];
		onApplyPreset: (preset: Preset) => void;
	}

	let { presets, onApplyPreset }: Props = $props();
</script>

<Card class="overflow-hidden">
	<div
		class="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700"
	>
		<h2 class="text-sm font-bold text-white">Trending Presets</h2>
	</div>
	<div class="grid grid-cols-4 gap-3 p-5">
		{#each presets as preset}
			<button
				class="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-black/5 transition-transform hover:scale-105"
				style="background: linear-gradient({preset.angle}deg, {preset.colors.join(', ')});"
				onclick={() => onApplyPreset(preset)}
				aria-label="Apply preset gradient"
			>
				<div
					class="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<span class="text-white drop-shadow-md">+</span>
				</div>
			</button>
		{/each}
	</div>
</Card>
