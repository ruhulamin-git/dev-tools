<script lang="ts">
	import { onDestroy } from 'svelte';
	import BeforeAfter from './BeforeAfter.svelte';
	import { Download } from '@lucide/svelte';
	import type { CompressionResult } from '../utils/compressor';

	type SelectedResult = CompressionResult & { file: File };

	const {
		selectedResult = null,
		results = [],
		format = 'image/jpeg',
		formatFileSize = () => '',
		onSelect = (result: SelectedResult) => {}
	} = $props<{
		selectedResult?: SelectedResult | null;
		results?: Array<SelectedResult>;
		format?: string;
		formatFileSize?: (bytes: number) => string;
		onSelect?: (result: SelectedResult) => void;
	}>();

	let previewUrl = $state('');
	let objectUrl: string | null = null;

	$effect(() => {
		if (selectedResult) {
			if (selectedResult.url) {
				previewUrl = selectedResult.url;
			} else {
				objectUrl && URL.revokeObjectURL(objectUrl);
				objectUrl = URL.createObjectURL(selectedResult.file);
				previewUrl = objectUrl;
			}
		} else {
			previewUrl = '';
		}

		return () => {
			objectUrl && URL.revokeObjectURL(objectUrl);
		};
	});

	function handleDownload() {
		if (!selectedResult?.blob) return;

		const format = selectedResult.blob.type.split('/').pop() || 'jpg';
		const fileName = `${selectedResult.file.name.replace(/\.[^/.]+$/, '')}_compressed.${format}`;

		const blobUrl = URL.createObjectURL(selectedResult.blob);
		const a = document.createElement('a');
		a.href = blobUrl;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();

		setTimeout(() => {
			URL.revokeObjectURL(blobUrl);
			document.body.removeChild(a);
		}, 100);
	}

	onDestroy(() => {
		objectUrl && URL.revokeObjectURL(objectUrl);
	});
</script>

{#if previewUrl && selectedResult}
	<div class="mt-0 w-full space-y-6 md:mt-14 md:w-1/2 lg:mt-14">
		<div class="mb-4">
			<div class="flex flex-wrap gap-2">
				{#each results.length ? results : [selectedResult] as result}
					<button
						onclick={() => onSelect(result)}
						class="h-12 w-12 overflow-hidden rounded-md border-2 transition-all {selectedResult ===
						result
							? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
							: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
					>
						<img
							src={result.url || URL.createObjectURL(result.file)}
							alt=""
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</button>
				{/each}
			</div>
		</div>

		<div class="h-[500px]">
			{#if selectedResult.compressedSize !== selectedResult.originalSize}
				<BeforeAfter originalFile={selectedResult.file} compressedResult={selectedResult} />
			{:else}
				<div class="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-900">
					<img
						src={previewUrl}
						alt={`Preview of ${selectedResult.file?.name || 'image'}`}
						class="max-h-full max-w-full object-contain"
						loading="lazy"
					/>
				</div>
			{/if}
		</div>

		<div class="mt-4 flex items-center justify-between">
			<div class="text-sm text-gray-500 dark:text-gray-400">
				{formatFileSize(selectedResult.originalSize)}
				{#if selectedResult.compressedSize !== selectedResult.originalSize}
					<span class="text-green-500">
						→ {formatFileSize(selectedResult.compressedSize)}
						(saved {Math.round(
							((selectedResult.originalSize - selectedResult.compressedSize) /
								selectedResult.originalSize) *
								100
						)}%)
					</span>
				{/if}
			</div>

			<button
				onclick={handleDownload}
				class="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
			>
				<Download class="mr-2 h-4 w-4" />
				Download
			</button>
		</div>
	</div>
{/if}
