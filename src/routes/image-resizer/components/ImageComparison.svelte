<script lang="ts">
	import { Button, Select, Label } from '$lib/shared/components/ui';
	import { imageResizeStore } from './imageStore.svelte';
	import { downloadImage } from './imageProcessing';
</script>

{#if imageResizeStore.image.resizedImageUrl}
	<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
		<h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Comparison</h2>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div class="flex flex-col gap-2">
				<h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">Original</h3>
				<div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
					{#if imageResizeStore.image.originalImageUrl}
						<img
							src={imageResizeStore.image.originalImageUrl}
							alt="Original"
							class="h-auto w-full object-contain"
							style="max-height: 300px;"
						/>
					{/if}
				</div>
				<p class="text-xs text-slate-500 dark:text-slate-400">
					{imageResizeStore.image.originalUploadedWidth} ×
					{imageResizeStore.image.originalUploadedHeight} px
				</p>
			</div>

			<div class="flex flex-col gap-2">
				<h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">Processed</h3>
				<div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
					<img
						src={imageResizeStore.image.resizedImageUrl}
						alt="Processed"
						class="h-auto w-full object-contain"
						style="max-height: 300px;"
					/>
				</div>
				<p class="text-xs text-slate-500 dark:text-slate-400">
					{imageResizeStore.image.processedWidth} × {imageResizeStore.image.processedHeight} px
				</p>
			</div>
		</div>

		<div class="mt-6 flex flex-col gap-3">
			<div class="flex flex-col gap-1.5">
				<Label htmlFor="download-format" class="text-slate-700 dark:text-slate-300">Download Format</Label>
				<Select
					bind:value={imageResizeStore.download.downloadFormat}
					id="download-format"
					class="w-full bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
					options={[
						{ value: 'png', label: 'PNG' },
						{ value: 'jpg', label: 'JPG' },
						{ value: 'webp', label: 'WebP' },
						{ value: 'svg', label: 'SVG' }
					]}
				/>
			</div>
			<Button onclick={downloadImage} class="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
				>Download Processed Image</Button
			>
		</div>
	</section>
{:else}
	<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
		<h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Comparison</h2>
		<div
			class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900"
		>
			<p class="text-sm text-slate-500 dark:text-slate-400">Resize the image to see comparison</p>
		</div>
	</section>
{/if}
