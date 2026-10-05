<script lang="ts">
	import { Download, Upload, Check, FileImage } from '@lucide/svelte';
	import { downloadAsZip } from '../utils/compressor';
	import type { CompressionResult } from '../utils/compressor';
	import Button from '$lib/shared/components/ui/button.svelte';

	const {
		results = [],
		format = 'image/jpeg',
		formatFileSize = (bytes: number) => bytes.toString(),
		onPreview = (result: any) => {}
	} = $props<{
		results?: Array<CompressionResult & { file: File }>;
		format?: string;
		formatFileSize?: (bytes: number) => string;
		onPreview?: (result: any) => void;
	}>();

	function handleDownload(result: CompressionResult & { file: File }, event: MouseEvent) {
		event.preventDefault();
		if (!result.blob) return;

		const extension = format.split('/')[1] || 'jpg';
		const fileName = `${result.file.name.replace(/\.[^/.]+$/, '')}_compressed.${extension}`;
		const url = URL.createObjectURL(result.blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();

		setTimeout(() => {
			URL.revokeObjectURL(url);
			if (document.body.contains(a)) {
				document.body.removeChild(a);
			}
		}, 100);
	}

	function handleDownloadAll() {
		if (results.length > 0) {
			downloadAsZip(results);
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Results</h2>
		{#if results.length > 0}
			<Button
				onclick={handleDownloadAll}
				class="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
				aria-label="Download all compressed images as ZIP"
			>
				<Download class="h-4 w-4" />
				Download All as ZIP
			</Button>
		{/if}
	</div>

	<div role="list" aria-label="Compression results">
		{#each results as result, i}
			<div class="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800" role="listitem">
				<div class="mb-4 flex items-center justify-between">
					<span class="flex items-center gap-2">
						<FileImage class="h-4 w-4 text-slate-500 dark:text-slate-400" />
						<span class="truncate font-medium text-slate-900 dark:text-slate-100" title={result.file.name}>
							{result.file.name}
						</span>
					</span>
					<div class="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onclick={() => onPreview(result)}
							class="text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
							aria-label={`Preview ${result.file.name}`}
						>
							Preview
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onclick={(e) => handleDownload(result, e)}
							class="text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
							aria-label={`Download ${result.file.name}`}
						>
							<Download class="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<div class="mb-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
							<Upload class="h-3 w-3" /> Original
						</div>
						<div class="text-sm font-medium text-slate-900 dark:text-slate-100">
							{formatFileSize(result.originalSize)}
						</div>
					</div>
					<div>
						<div class="mb-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
							<Download class="h-3 w-3" /> Compressed
						</div>
						<div class="text-sm font-medium text-green-600">
							{formatFileSize(result.compressedSize)} ({Math.round(100 - result.compressionRatio)}%
							smaller)
							{#if result.compressionRatio > 0}
								<Check class="ml-1 inline h-3 w-3" />
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
