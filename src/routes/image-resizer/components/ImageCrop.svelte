<script lang="ts">
	import { Button, Input, Select, Label } from '$lib/shared/components/ui';
	import { imageResizeStore } from './imageStore.svelte';
	import { cropAspectRatios } from './imageUtils';
	import { calculateImageScale, resetCropArea } from './imageUtils';
	import { applyCrop } from './cropUtils';

	function startCrop() {
		imageResizeStore.crop.isCropMode = true;
		imageResizeStore.crop.isDragging = false;
		imageResizeStore.crop.cropStartX = 0;
		imageResizeStore.crop.cropStartY = 0;
		imageResizeStore.crop.cropEndX = 0;
		imageResizeStore.crop.cropEndY = 0;
		setTimeout(() => {
			if (imageResizeStore.crop.cropContainer) {
				const { scale, offsetX, offsetY } = calculateImageScale(
					imageResizeStore.image.originalWidth,
					imageResizeStore.image.originalHeight,
					imageResizeStore.crop.cropContainer
				);
				imageResizeStore.crop.imageScale = scale;
				imageResizeStore.crop.imageOffsetX = offsetX;
				imageResizeStore.crop.imageOffsetY = offsetY;
				const area = resetCropArea(
					imageResizeStore.image.originalWidth,
					imageResizeStore.image.originalHeight,
					imageResizeStore.crop.cropContainer
				);
				imageResizeStore.crop.cropStartX = area.startX;
				imageResizeStore.crop.cropStartY = area.startY;
				imageResizeStore.crop.cropEndX = area.endX;
				imageResizeStore.crop.cropEndY = area.endY;
			}
		}, 50);
	}

	function cancelCrop() {
		imageResizeStore.crop.isCropMode = false;
		imageResizeStore.crop.croppedImageUrl = null;
	}

	function onApplyCrop() {
		if (imageResizeStore.crop.cropContainer) {
			applyCrop(imageResizeStore.crop.cropContainer);
		}
	}
</script>

<section
	class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
>
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Crop Image</h2>
		{#if !imageResizeStore.crop.isCropMode}
			<Button onclick={startCrop}>Start Crop</Button>
		{:else}
			<div class="flex gap-2">
				<Button onclick={cancelCrop}>Cancel</Button>
				<Button onclick={onApplyCrop}>Apply Crop</Button>
			</div>
		{/if}
	</div>

	{#if imageResizeStore.crop.isCropMode}
		<div class="space-y-4">
			<div>
				<Label htmlFor="crop-mode" class="mb-2 block text-slate-900 dark:text-slate-100">
					Crop Mode
				</Label>
				<Select
					bind:value={imageResizeStore.crop.cropMode}
					id="crop-mode"
					class="w-full text-slate-900 dark:text-slate-100"
					options={[
						{ value: 'aspect', label: 'Maintain Aspect Ratio' },
						{ value: 'custom', label: 'Custom Size' }
					]}
				/>
			</div>

			{#if imageResizeStore.crop.cropMode === 'aspect'}
				<div>
					<Label htmlFor="crop-aspect" class="mb-2 block text-slate-900 dark:text-slate-100">
						Aspect Ratio
					</Label>
					<Select
						bind:value={imageResizeStore.crop.cropAspectRatio}
						id="crop-aspect"
						class="w-full text-slate-900 dark:text-slate-100"
						options={cropAspectRatios.map((ratio) => ({ value: ratio.value, label: ratio.label }))}
					/>
				</div>

				{#if imageResizeStore.crop.cropAspectRatio === 'custom'}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label
								htmlFor="crop-custom-width"
								class="mb-2 block text-slate-900 dark:text-slate-100"
							>
								Ratio Width
							</Label>
							<Input
								type="number"
								id="crop-custom-width"
								bind:value={imageResizeStore.crop.cropCustomWidth}
								min="1"
							/>
						</div>
						<div>
							<Label
								htmlFor="crop-custom-height"
								class="mb-2 block text-slate-900 dark:text-slate-100"
							>
								Ratio Height
							</Label>
							<Input
								type="number"
								id="crop-custom-height"
								bind:value={imageResizeStore.crop.cropCustomHeight}
								min="1"
							/>
						</div>
					</div>
				{/if}
			{/if}

			<p class="text-sm text-slate-600 dark:text-slate-300">
				Click and drag on the preview image to select the crop area
			</p>
		</div>
	{/if}
</section>
