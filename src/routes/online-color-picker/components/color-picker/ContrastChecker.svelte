<script lang="ts">
	import { Card } from '$lib/shared/components';
	import { Check } from '$lib/shared/icons';

	interface Props {
		selectedColor: string;
		contrastWhite: number;
		contrastBlack: number;
	}

	let { selectedColor, contrastWhite, contrastBlack }: Props = $props();
</script>

<Card class="flex-1 overflow-hidden">
	<div
		class="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-700/50"
	>
		<h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Contrast Check (WCAG)</h2>
	</div>
	<div class="flex flex-col gap-6 p-5 md:flex-row">
		<!-- Preview Cards -->
		<div class="flex flex-1 flex-col gap-3">
			<div
				class="flex flex-1 flex-col items-center justify-center rounded-lg p-4 text-center text-white"
				style="background-color: {selectedColor};"
			>
				<span class="text-lg font-bold">White Text</span>
				<span class="text-sm opacity-90">on Current Color</span>
			</div>
			<div
				class="flex flex-1 flex-col items-center justify-center rounded-lg p-4 text-center"
				style="background-color: {selectedColor}; color: #000000;"
			>
				<span class="text-lg font-bold">Black Text</span>
				<span class="text-sm" style="color: rgba(0,0,0,0.8);">on Current Color</span>
			</div>
		</div>

		<!-- Results -->
		<div class="flex w-full flex-col justify-between gap-4 md:w-48">
			<div class="flex flex-col gap-1">
				<span class="text-xs font-bold text-slate-600 uppercase dark:text-slate-100"
					>Contrast Ratio</span
				>
				<span class="text-3xl font-black text-white"
					>{contrastWhite > contrastBlack
						? contrastWhite.toFixed(2)
						: contrastBlack.toFixed(2)}:1</span
				>
			</div>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-600 dark:text-slate-100">AA Normal</span>
					{#if Math.max(contrastWhite, contrastBlack) >= 4.5}
						<span
							class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400"
						>
							PASS <Check class="h-3 w-3" />
						</span>
					{:else}
						<span
							class="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400"
						>
							FAIL
						</span>
					{/if}
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-600 dark:text-slate-100">AA Large</span>
					{#if Math.max(contrastWhite, contrastBlack) >= 3}
						<span
							class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400"
						>
							PASS <Check class="h-3 w-3" />
						</span>
					{:else}
						<span
							class="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400"
						>
							FAIL
						</span>
					{/if}
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-600 dark:text-slate-100">AAA Normal</span>
					{#if Math.max(contrastWhite, contrastBlack) >= 7}
						<span
							class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400"
						>
							PASS <Check class="h-3 w-3" />
						</span>
					{:else}
						<span
							class="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400"
						>
							FAIL
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Card>
