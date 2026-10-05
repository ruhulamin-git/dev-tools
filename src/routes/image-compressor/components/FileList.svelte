<script lang="ts">
	import { FileImage, X } from '@lucide/svelte';
	import type { CompressionResult } from '../utils/compressor';
	import Button from '$lib/shared/components/ui/button.svelte';

	const {
		files = [],
		results = [],
		formatFileSize = (bytes: number) => bytes.toString(),
		onDelete = (index: number) => {},
		onPreview = (file: File) => {}
	} = $props<{
		files: File[];
		results: Array<CompressionResult & { file: File }>;
		formatFileSize?: (bytes: number) => string;
		onDelete?: (index: number) => void;
		onPreview?: (file: File) => void;
	}>();

	function handleDelete(index: number, event: MouseEvent) {
		event.stopPropagation();
		onDelete(index);
	}
</script>

<div class="space-y-2" role="list" aria-label="Selected files">
	{#each files as file, i}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
			role="listitem"
			onclick={() => onPreview(file)}
		>
			<span class="flex items-center gap-2 text-sm" title={file.name}>
				<FileImage class="h-4 w-4 text-slate-500" />
				<span class="truncate text-slate-600">{file.name}</span>
			</span>
			<div class="flex items-center gap-2">
				<span class="text-xs text-slate-500">
					{formatFileSize(file.size)}
				</span>
				<Button
					variant="ghost"
					size="icon"
					onclick={(e) => handleDelete(i, e)}
					class="ml-2 h-6 w-6 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
					aria-label={`Delete ${file.name}`}
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</div>
	{/each}
</div>
