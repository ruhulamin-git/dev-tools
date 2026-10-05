<script lang="ts">
	type HarmonyType =
		| 'complementary'
		| 'analogous'
		| 'triadic'
		| 'monochromatic'
		| 'split'
		| 'square';

	interface Harmony {
		type: HarmonyType;
		label: string;
		icon: string;
	}

	interface Props {
		harmonies: Harmony[];
		selectedHarmony: HarmonyType;
		onSelectHarmony: (type: HarmonyType) => void;
	}

	let { harmonies, selectedHarmony, onSelectHarmony }: Props = $props();
</script>

<div class="flex flex-1 flex-wrap justify-center gap-2">
	{#each harmonies as harmony}
		<button
			class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all {selectedHarmony ===
			harmony.type
				? 'bg-slate-900 text-white shadow-md'
				: 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
			onclick={() => onSelectHarmony(harmony.type)}
		>
			<span>{harmony.icon}</span>
			{harmony.label}
		</button>
	{/each}
</div>
