<script lang="ts">
	import { Button } from '$lib/shared/components/ui';
	import { imageResizeStore } from './imageStore.svelte';
	import { loadImageFromFile } from './imageUtils';

	let fileInputElement: HTMLInputElement;

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file && file.type.startsWith('image/')) {
			try {
				const { image, url } = await loadImageFromFile(file);
				imageResizeStore.image.selectedFile = file;
				imageResizeStore.image.originalImage = image;
				imageResizeStore.image.originalImageUrl = url;
				imageResizeStore.image.originalWidth = image.width;
				imageResizeStore.image.originalHeight = image.height;
				imageResizeStore.image.originalUploadedWidth = image.width;
				imageResizeStore.image.originalUploadedHeight = image.height;
				imageResizeStore.resize.targetWidth = image.width;
				imageResizeStore.resize.targetHeight = image.height;
				imageResizeStore.resize.aspectRatioWidth = image.width;
				imageResizeStore.crop.isCropMode = false;
				imageResizeStore.crop.croppedImageUrl = null;
				imageResizeStore.image.resizedImageUrl = null;
				imageResizeStore.image.processedWidth = 0;
				imageResizeStore.image.processedHeight = 0;
			} catch (error) {
				console.error('Error loading image:', error);
			}
		}
	}

	function resetAll() {
		imageResizeStore.reset();
		if (fileInputElement) {
			fileInputElement.value = '';
		}
	}
</script>

<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
	<h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Upload Image</h2>

	<div class="flex flex-col items-center justify-center gap-4">
		<input
			bind:this={fileInputElement}
			type="file"
			accept="image/*"
			onchange={handleFileSelect}
			class="hidden"
			id="image-upload"
		/>

		<button type="button" onclick={() => fileInputElement?.click()} class="w-full cursor-pointer">
			<div
				class="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-slate-400 hover:bg-slate-100"
			>
				{#if imageResizeStore.image.selectedFile}
					<div class="text-center">
						<p class="text-sm font-medium text-slate-900">
							{imageResizeStore.image.selectedFile.name}
						</p>
						<p class="text-xs text-slate-600">
							{imageResizeStore.image.originalWidth} × {imageResizeStore.image.originalHeight} px
						</p>
					</div>
				{:else}
					<div class="text-center">
						<p class="text-sm font-medium text-slate-700">Click to upload an image</p>
						<p class="text-xs text-slate-500">PNG, JPG, GIF, or WebP</p>
					</div>
				{/if}
			</div>
		</button>

		{#if imageResizeStore.image.selectedFile}
			<Button
				variant="outline"
				onclick={resetAll}
				class="bg-slate-900 text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-800 hover:shadow-xl"
				>Reset</Button
			>
		{/if}
	</div>
</section>
