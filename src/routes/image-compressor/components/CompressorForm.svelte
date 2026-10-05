<script lang="ts">
	import { compressImages, formatFileSize, type CompressionResult } from '../utils/compressor';
	import { onDestroy } from 'svelte';
	import { Upload, AlertCircle } from '@lucide/svelte';
	import ImagePreview from './ImagePreview.svelte';
	import DownloadResults from './DownloadResults.svelte';
	import FileList from './FileList.svelte';
	import CompressionOptions from './CompressionOptions.svelte';

	let fileInput: HTMLInputElement;
	let files: File[] = $state([]);
	let results: (CompressionResult & { file: File })[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let previewUrl = $state('');
	let selectedResult = $state<(CompressionResult & { file: File }) | null>(null);
	let isDragging = $state(false);
	let quality = $state(80);
	let maxWidth = $state(1920);
	let maxHeight = $state(1080);
	let format: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = $state('image/jpeg');
	let preserveExif = $state(false);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		const droppedFiles = Array.from(e.dataTransfer?.files || []);
		handleFiles(droppedFiles);
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const selectedFiles = Array.from(target.files || []);
		handleFiles(selectedFiles);
	}

	function handleFiles(selectedFiles: File[]) {
		const validFiles = selectedFiles.filter(
			(file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
		);

		if (validFiles.length !== selectedFiles.length) {
			error = 'Some files are not images or exceed 10MB limit';
		} else {
			error = '';
		}

		files = [...files, ...validFiles];
		if (validFiles.length > 0) {
			const fileToPreview = validFiles[0];
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			previewUrl = URL.createObjectURL(fileToPreview);
			selectedResult = {
				file: fileToPreview,
				blob: new Blob([fileToPreview], { type: fileToPreview.type }),
				url: previewUrl,
				originalSize: fileToPreview.size,
				compressedSize: fileToPreview.size,
				compressionRatio: 0
			};
		}
	}

	function handleReset() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		results.forEach((result) => {
			if (result?.url) URL.revokeObjectURL(result.url);
		});

		files = [];
		results = [];
		selectedResult = null;
		error = '';
		previewUrl = '';
		if (fileInput) fileInput.value = '';
	}

	function previewResult(result: CompressionResult & { file: File }) {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = result.url;
		selectedResult = result;
		if (!result.url && result.file) {
			previewUrl = URL.createObjectURL(result.file);
		}
	}

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		results.forEach((result) => {
			if (result?.url) URL.revokeObjectURL(result.url);
		});
	});
</script>

<div
	class="mx-auto flex flex-col gap-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row dark:border-slate-700 dark:bg-slate-800"
	role="region"
	aria-label="Image compression interface"
>
	<div class="w-full space-y-6 md:w-1/2">
		<div
			class={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
				isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'
			}`}
			role="button"
			tabindex="0"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
			aria-label="Drag and drop area for image files"
		>
			<input
				type="file"
				accept="image/*"
				onchange={handleFileSelect}
				bind:this={fileInput}
				disabled={loading}
				multiple
				class="hidden"
				id="file-upload"
				aria-label="Select image files"
			/>
			<label
				for="file-upload"
				class="flex cursor-pointer flex-col items-center justify-center space-y-2"
			>
				<Upload class="h-12 w-12 text-slate-400" />
				<span class="text-slate-600">Click to upload or drag and drop</span>
				<span class="text-sm text-slate-500">JPG, PNG, WebP, GIF (max 10MB each)</span>
				{#if files.length > 0}
					<span class="mt-2 text-sm font-medium text-blue-600">
						{files.length} file{files.length > 1 ? 's' : ''} selected
					</span>
				{/if}
			</label>
		</div>

		{#if files.length > 0}
			<FileList
				{files}
				{results}
				{formatFileSize}
				onDelete={(index) => {
					files = files.filter((_, i) => i !== index);
					if (results[index]) {
						URL.revokeObjectURL(results[index].url);
						results = results.filter((_, i) => i !== index);
					}
					if (selectedResult?.file?.name === files[index]?.name) {
						if (files.length > 0) {
							const newIndex = Math.min(index, files.length - 1);
							const newFile = files[newIndex];
							previewResult({
								file: newFile,
								blob: new Blob([newFile], { type: newFile.type }),
								url: URL.createObjectURL(newFile),
								originalSize: newFile.size,
								compressedSize: newFile.size,
								compressionRatio: 0
							});
						} else {
							if (previewUrl) URL.revokeObjectURL(previewUrl);
							previewUrl = '';
							selectedResult = null;
						}
					}
				}}
				onPreview={(file) => {
					const result = results.find((r) => r.file === file);
					if (result) {
						previewResult(result);
					} else {
						previewResult({
							file,
							blob: new Blob([file], { type: file.type }),
							url: URL.createObjectURL(file),
							originalSize: file.size,
							compressedSize: file.size,
							compressionRatio: 0
						});
					}
				}}
			/>
		{/if}

		<CompressionOptions
			{loading}
			{quality}
			{format}
			{maxWidth}
			{maxHeight}
			{preserveExif}
			{files}
			onCompress={async (options) => {
				loading = true;
				error = '';
				try {
					const compressionResults = await compressImages(files, options);
					const newResults = compressionResults.map((result, i) => ({
						...result,
						file: files[i]
					}));
					results = newResults;
					if (newResults.length > 0) {
						previewResult(newResults[0]);
					}
					return newResults;
				} catch (e) {
					error = e instanceof Error ? e.message : 'Failed to compress images';
					throw e;
				} finally {
					loading = false;
				}
			}}
			onError={(message) => {
				error = message;
			}}
			onResults={(newResults) => {
				results = newResults;
				if (newResults.length > 0) {
					previewResult(newResults[0]);
				}
			}}
			onQualityChange={(value) => (quality = value)}
			onFormatChange={(value) => (format = value)}
			onMaxWidthChange={(value) => (maxWidth = value)}
			onMaxHeightChange={(value) => (maxHeight = value)}
			onPreserveExifChange={(value) => (preserveExif = value)}
			onReset={handleReset}
		/>

		{#if error}
			<div class="rounded-md bg-red-50 p-4 text-red-700" role="alert">
				<div class="flex items-center">
					<AlertCircle class="h-5 w-5 text-red-400" />
					<p class="ml-3 text-sm">{error}</p>
				</div>
			</div>
		{/if}

		{#if results.length > 0}
			<DownloadResults
				{results}
				{format}
				{formatFileSize}
				onPreview={(result) => previewResult(result)}
			/>
		{/if}
	</div>

	{#if files.length > 0}
		<ImagePreview
			selectedResult={selectedResult || {
				file: files[0],
				blob: new Blob([files[0]], { type: files[0].type }),
				url: URL.createObjectURL(files[0]),
				originalSize: files[0].size,
				compressedSize: files[0].size,
				compressionRatio: 0
			}}
			results={files.map((file) => ({
				file,
				blob: new Blob([file], { type: file.type }),
				url: URL.createObjectURL(file),
				originalSize: file.size,
				compressedSize: file.size,
				compressionRatio: 0
			}))}
			{format}
			onSelect={(result) => {
				selectedResult = result;
			}}
		/>
	{/if}
</div>
