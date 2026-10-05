<script lang="ts">
	import { Button, Input, Select, Label } from '$lib/shared/components/ui';
	import { imageResizeStore } from './imageStore.svelte';
	import { aspectRatios } from './imageUtils';
	import { resizeImage } from './imageProcessing';

	$effect(() => {
		if (
			imageResizeStore.resize.resizeMode === 'pixel' &&
			imageResizeStore.resize.maintainAspectRatio &&
			imageResizeStore.image.originalWidth > 0
		) {
			const aspectRatio =
				imageResizeStore.image.originalWidth / imageResizeStore.image.originalHeight;
			imageResizeStore.resize.targetHeight = Math.round(
				imageResizeStore.resize.targetWidth / aspectRatio
			);
		}
	});
</script>

<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
	<h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Resize Options</h2>

	<div class="mb-6 flex flex-col gap-1.5">
		<Label htmlFor="resize-mode" class="text-slate-700 dark:text-slate-300">Resize Mode</Label>
		<Select
			bind:value={imageResizeStore.resize.resizeMode}
			id="resize-mode"
			class="w-full bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
			options={[
				{ value: 'percentage', label: 'Percentage' },
				{ value: 'pixel', label: 'Pixel Dimensions' },
				{ value: 'aspect', label: 'Aspect Ratio' }
			]}
		/>
	</div>

	{#if imageResizeStore.resize.resizeMode === 'percentage'}
		<div class="mb-6 flex flex-col gap-1.5">
			<Label htmlFor="percentage" class="text-slate-700 dark:text-slate-300">
				Resize Percentage: {imageResizeStore.resize.resizePercentage}%
			</Label>
			<input
				type="range"
				id="percentage"
				bind:value={imageResizeStore.resize.resizePercentage}
				min="10"
				max="200"
				step="5"
				class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-600"
			/>
			<div class="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
				<span>10%</span>
				<span>200%</span>
			</div>
			<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
				New size:
				{Math.round(
					imageResizeStore.image.originalWidth * (imageResizeStore.resize.resizePercentage / 100)
				)}{' '}
				×
				{Math.round(
					imageResizeStore.image.originalHeight * (imageResizeStore.resize.resizePercentage / 100)
				)}{' '}
				px
			</p>
		</div>
	{/if}

	{#if imageResizeStore.resize.resizeMode === 'pixel'}
		<div class="mb-6 space-y-4">
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					id="maintain-aspect"
					bind:checked={imageResizeStore.resize.maintainAspectRatio}
					class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
				/>
				<Label htmlFor="maintain-aspect" class="cursor-pointer text-slate-700 dark:text-slate-300">
					Maintain Aspect Ratio
				</Label>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<Label htmlFor="target-width" class="text-slate-700 dark:text-slate-300">Width (px)</Label>
					<Input
						type="number"
						id="target-width"
						bind:value={imageResizeStore.resize.targetWidth}
						min="1"
						class="bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label htmlFor="target-height" class="text-slate-700 dark:text-slate-300">Height (px)</Label>
					<Input
						type="number"
						id="target-height"
						bind:value={imageResizeStore.resize.targetHeight}
						min="1"
						disabled={imageResizeStore.resize.maintainAspectRatio}
						class="bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
					/>
				</div>
			</div>
		</div>
	{/if}

	{#if imageResizeStore.resize.resizeMode === 'aspect'}
		<div class="mb-6 space-y-4">
			<div class="flex flex-col gap-1.5">
				<Label htmlFor="aspect-preset" class="text-slate-700 dark:text-slate-300">Aspect Ratio Preset</Label>
				<Select
					bind:value={imageResizeStore.resize.aspectRatioPreset}
					id="aspect-preset"
					class="w-full bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
					options={aspectRatios.map((ratio) => ({ value: ratio.value, label: ratio.label }))}
				/>
			</div>

			{#if imageResizeStore.resize.aspectRatioPreset === 'custom'}
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<Label htmlFor="custom-aspect-width" class="text-slate-700 dark:text-slate-300">Ratio Width</Label>
						<Input
							type="number"
							id="custom-aspect-width"
							bind:value={imageResizeStore.resize.customAspectWidth}
							min="1"
							class="bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label htmlFor="custom-aspect-height" class="text-slate-700 dark:text-slate-300">Ratio Height</Label>
						<Input
							type="number"
							id="custom-aspect-height"
							bind:value={imageResizeStore.resize.customAspectHeight}
							min="1"
							class="bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
						/>
					</div>
				</div>
			{/if}

			<div class="flex flex-col gap-1.5">
				<Label htmlFor="aspect-width" class="text-slate-700 dark:text-slate-300">Target Width (px)</Label>
				<Input
					type="number"
					id="aspect-width"
					bind:value={imageResizeStore.resize.aspectRatioWidth}
					min="1"
					class="bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
				/>
				<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
					Calculated height:
					{Math.round(
						imageResizeStore.resize.aspectRatioWidth /
							(imageResizeStore.resize.aspectRatioPreset === 'custom'
								? imageResizeStore.resize.customAspectWidth /
									imageResizeStore.resize.customAspectHeight
								: aspectRatios.find((r) => r.value === imageResizeStore.resize.aspectRatioPreset)
										?.ratio || 1)
					)}{' '}
					px
				</p>
			</div>
		</div>
	{/if}

	<Button onclick={resizeImage} class="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
		>Resize Image</Button
	>
</section>
