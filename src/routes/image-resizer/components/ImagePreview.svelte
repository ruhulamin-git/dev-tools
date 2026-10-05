<script lang="ts">
	import { imageResizeStore } from './imageStore.svelte';
	import { handleCropMouseDown, handleCropMouseMove, handleCropMouseUp } from './cropUtils';

	let cropContainer = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (cropContainer) {
			imageResizeStore.crop.cropContainer = cropContainer;
		}
	});

	function onMouseDown(e: MouseEvent) {
		if (cropContainer) {
			handleCropMouseDown(e, cropContainer);
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (cropContainer) {
			handleCropMouseMove(e, cropContainer);
		}
	}

	$effect(() => {
		if (imageResizeStore.crop.isCropMode && cropContainer) {
			const container = cropContainer;
			container.addEventListener('mousedown', onMouseDown);
			window.addEventListener('mousemove', onMouseMove);
			window.addEventListener('mouseup', handleCropMouseUp);

			return () => {
				container.removeEventListener('mousedown', onMouseDown);
				window.removeEventListener('mousemove', onMouseMove);
				window.removeEventListener('mouseup', handleCropMouseUp);
			};
		}
	});
</script>

{#if imageResizeStore.image.originalImage}
	<section
		class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
	>
		<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Image Preview</h2>

		<div
			bind:this={cropContainer}
			class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
			style="min-height: 400px; cursor: {imageResizeStore.crop.isCropMode
				? 'crosshair'
				: 'default'}; user-select: none;"
		>
			<img
				src={imageResizeStore.image.originalImage.src}
				alt="Preview"
				class="h-auto w-full object-contain"
				style="max-height: 500px; display: block;"
			/>

			{#if imageResizeStore.crop.isCropMode && (imageResizeStore.crop.cropStartX !== imageResizeStore.crop.cropEndX || imageResizeStore.crop.cropStartY !== imageResizeStore.crop.cropEndY)}
				{#if true}
					{@const cropLeft = Math.min(
						imageResizeStore.crop.cropStartX,
						imageResizeStore.crop.cropEndX
					)}
					{@const cropTop = Math.min(
						imageResizeStore.crop.cropStartY,
						imageResizeStore.crop.cropEndY
					)}
					{@const cropRight = Math.max(
						imageResizeStore.crop.cropStartX,
						imageResizeStore.crop.cropEndX
					)}
					{@const cropBottom = Math.max(
						imageResizeStore.crop.cropStartY,
						imageResizeStore.crop.cropEndY
					)}
					{@const cropWidth = cropRight - cropLeft}
					{@const cropHeight = cropBottom - cropTop}
					<div
						class="pointer-events-none absolute bg-black/50"
						style="left: 0; top: 0; width: 100%; height: {cropTop}px;"
					></div>
					<div
						class="pointer-events-none absolute bg-black/50"
						style="left: 0; top: {cropBottom}px; width: 100%; height: calc(100% - {cropBottom}px);"
					></div>
					<div
						class="pointer-events-none absolute bg-black/50"
						style="left: 0; top: {cropTop}px; width: {cropLeft}px; height: {cropHeight}px;"
					></div>
					<div
						class="pointer-events-none absolute bg-black/50"
						style="left: {cropRight}px; top: {cropTop}px; width: calc(100% - {cropRight}px); height: {cropHeight}px;"
					></div>
					<div
						class="pointer-events-none absolute border-2 border-blue-500"
						style="left: {cropLeft}px; top: {cropTop}px; width: {cropWidth}px; height: {cropHeight}px;"
					></div>
				{/if}
			{/if}
		</div>

		<p class="mt-2 text-xs text-slate-600 dark:text-slate-400">
			{imageResizeStore.image.originalWidth} × {imageResizeStore.image.originalHeight} px
		</p>
	</section>
{:else}
	<section
		class="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
	>
		<h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Image Preview</h2>
		<div
			class="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
		>
			<p class="text-sm text-slate-600 dark:text-slate-400">Upload an image to see preview</p>
		</div>
	</section>
{/if}
