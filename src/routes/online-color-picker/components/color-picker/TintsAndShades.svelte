<script lang="ts">
	import { base } from '$app/paths';
	import { Card } from '$lib/shared/components';

	interface Props {
		tints: string[];
		shades: string[];
		onCopy: (color: string, field: string) => void;
	}

	let { tints, shades, onCopy }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<!-- Tints -->
	<Card class="p-5">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-sm font-bold text-slate-900 dark:text-white">Tints (Lighter)</h2>
			<a
				href="{base}/online-color-picker/shades"
				class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
			>
				View All
			</a>
		</div>
		<div class="flex h-12 w-full overflow-hidden rounded-lg">
			{#each tints as tint}
				<button
					class="flex-1 cursor-pointer transition-all duration-300 hover:flex-[1.5]"
					style="background-color: {tint};"
					onclick={() => onCopy(tint, tint)}
					title={tint}
					aria-label="Copy {tint}"
				></button>
			{/each}
		</div>
	</Card>

	<!-- Shades -->
	<Card class="p-5">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-sm font-bold text-slate-900 dark:text-white">Shades (Darker)</h2>
			<a
				href="{base}/online-color-picker/shades"
				class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
			>
				View All
			</a>
		</div>
		<div class="flex h-12 w-full overflow-hidden rounded-lg">
			{#each shades as shade}
				<button
					class="flex-1 cursor-pointer transition-all duration-300 hover:flex-[1.5]"
					style="background-color: {shade};"
					onclick={() => onCopy(shade, shade)}
					title={shade}
					aria-label="Copy {shade}"
				></button>
			{/each}
		</div>
	</Card>
</div>
