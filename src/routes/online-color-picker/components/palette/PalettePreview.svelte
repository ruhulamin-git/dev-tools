<script lang="ts">
	import { Card } from '$lib/shared/components';

	interface Props {
		palette: string[];
	}

	let { palette }: Props = $props();
</script>

<section aria-labelledby="preview-heading">
	<h2 id="preview-heading" class="my-5 text-lg font-bold text-white">
		Preview in Context
	</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Card Preview -->
		<Card class="p-4">
			<div class="mb-4 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
					style="background-color: {palette[0]};"
				>
					A
				</div>
				<div>
					<div class="mb-1.5 h-3 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
					<div class="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800"></div>
				</div>
			</div>
			<div
				class="mb-4 flex h-24 items-center justify-center rounded-lg border dark:border-slate-700"
				style="background-color: {palette[0]}20; border-color: {palette[0]}40;"
			>
				<span class="text-sm font-medium dark:text-slate-200" style="color: {palette[0]};"
					>Primary Surface</span
				>
			</div>
			<button
				class="w-full rounded py-2 text-sm font-medium text-white"
				style="background-color: {palette[0]};"
			>
				Primary Button
			</button>
		</Card>

		<!-- Chart Preview -->
		<Card class="flex flex-col justify-between p-4">
			<div
				class="flex h-32 items-end justify-between gap-2 border-b border-slate-100 px-2 pb-2 dark:border-slate-700"
			>
				{#each palette.slice(0, 4) as color, i}
					<div
						class="w-full rounded-t-sm"
						style="background-color: {color}; height: {40 + i * 15}%;"
					></div>
				{/each}
			</div>
			<div class="flex justify-between px-2 pt-2">
				{#each palette.slice(0, 4) as _}
					<div class="h-2 w-8 rounded bg-slate-200 dark:bg-slate-700"></div>
				{/each}
			</div>
		</Card>

		<!-- Alert Preview -->
		<Card class="flex flex-col gap-3 p-4">
			{#each palette.slice(0, 2) as color, i}
				<div
					class="flex gap-3 rounded-lg border p-3"
					style="background-color: {color}10; border-color: {color}20;"
				>
					<span style="color: {color};">{i === 0 ? 'ℹ️' : '✅'}</span>
					<div class="flex-1">
						<div class="mb-1 h-3 w-3/4 rounded" style="background-color: {color}20;"></div>
						<div class="h-2 w-1/2 rounded" style="background-color: {color}10;"></div>
					</div>
				</div>
			{/each}
		</Card>
	</div>
</section>
