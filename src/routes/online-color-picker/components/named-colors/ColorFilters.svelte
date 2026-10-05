<script lang="ts">
	import { Card, Input } from '$lib/shared/components';

	interface Props {
		searchQuery: string;
		selectedFamily: string;
		families: string[];
		onSearchChange: (query: string) => void;
		onFamilyChange: (family: string) => void;
	}

	let {
		searchQuery = $bindable(),
		selectedFamily,
		families,
		onSearchChange,
		onFamilyChange
	}: Props = $props();
</script>

<Card class="p-4">
	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<!-- Search -->
		<div class="group relative w-full md:w-96">
			<span
				class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
			>
				🔍
			</span>
			<Input
				bind:value={searchQuery}
				placeholder="Search colors..."
				class="w-full pl-10"
				ariaLabel="Search colors"
			/>
		</div>

		<!-- Family Filter -->
		<div class="flex flex-wrap gap-2">
			{#each families as family}
				<button
					class="rounded-full px-3 py-1 text-xs font-medium transition-all {selectedFamily ===
					family
						? 'bg-slate-900 text-white shadow-sm'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}"
					onclick={() => onFamilyChange(family)}
				>
					{family}
				</button>
			{/each}
		</div>
	</div>
</Card>
