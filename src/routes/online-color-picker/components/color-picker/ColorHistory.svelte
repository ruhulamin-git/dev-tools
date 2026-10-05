<script lang="ts">
	interface Props {
		colorHistory: string[];
		onSelectColor: (hex: string) => void;
		onClearHistory: () => void;
	}

	let { colorHistory, onSelectColor, onClearHistory }: Props = $props();
</script>

{#if colorHistory.length > 0}
	<section aria-labelledby="history-heading">
		<div class="my-5 flex items-center justify-between">
			<h2 id="history-heading" class="text-lg font-bold text-white">
				Recent Colors
			</h2>
			<button
				class="text-xs font-medium text-slate-600 transition-colors hover:text-red-600 dark:text-slate-100 dark:hover:text-red-400"
				onclick={onClearHistory}
			>
				Clear History
			</button>
		</div>
		<div class="flex flex-wrap gap-3">
			{#each colorHistory as color}
				<button
					class="group relative h-12 w-12 overflow-hidden rounded-lg shadow-sm transition-all hover:scale-110 hover:shadow-md"
					style="background-color: {color};"
					onclick={() => onSelectColor(color)}
					title={color}
					aria-label="Select {color}"
				>
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<span class="text-xs font-bold text-white">✓</span>
					</div>
				</button>
			{/each}
		</div>
	</section>
{/if}
