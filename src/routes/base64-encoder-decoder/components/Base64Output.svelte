<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Button,
		Textarea
	} from '$lib/shared/components/ui';
	import type { ProcessingResult } from '../utils/base64Encoder';
	import { base64ToBlob } from '../utils/base64Encoder';

	interface Props {
		result: ProcessingResult | null;
	}
	let { result }: Props = $props();
	let copied = $state(false);

	async function copyToClipboard() {
		if (!result?.output) return;
		try {
			let textToCopy = result.output;
			if (!result.isImage && result.output.startsWith('data:')) {
				const match = result.output.match(/^data:[^;]+;base64,(.+)$/);
				if (match) textToCopy = match[1];
			}
			await navigator.clipboard.writeText(textToCopy);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {}
	}

	function downloadFile() {
		if (!result?.output) return;
		try {
			const blob = base64ToBlob(result.output, result.mimeType || 'application/octet-stream');
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `decoded-file.${(result.mimeType || 'bin').split('/')[1] || 'bin'}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {}
	}
</script>

<Card class="flex h-full flex-col border-slate-200 shadow-sm dark:border-slate-800">
	<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
		<CardTitle class="text-xl font-semibold tracking-tight">
			{result?.isImage ? 'Image Output' : 'Output'}
		</CardTitle>
		{#if result?.success && result.output}
			<div class="flex gap-2">
				{#if result.isImage || result.mimeType !== 'text/plain'}
					<Button
						variant="outline"
						size="icon"
						onclick={downloadFile}
						title="Download"
						class="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
							><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
								points="7 10 12 15 17 10"
							/><line x1="12" y1="15" x2="12" y2="3" /></svg
						>
					</Button>
				{/if}
				<Button
					variant="outline"
					size="icon"
					onclick={copyToClipboard}
					title="Copy"
					class="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
				>
					{#if copied}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
							><rect width="14" height="14" x="8" y="8" rx="2" /><path
								d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
							/></svg
						>
					{/if}
				</Button>
			</div>
		{/if}
	</CardHeader>
	<CardContent class="min-h-0 flex-1">
		{#if result?.error}
			<div
				class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20"
			>
				<div class="flex items-start gap-3">
					<div class="shrink-0 pt-0.5">
						<svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
						<p class="mt-1 text-sm text-red-700 dark:text-red-300">{result.error}</p>
					</div>
				</div>
			</div>
		{:else if result?.success && result.output}
			<div class="flex h-full flex-col gap-4">
				{#if result.isImage}
					<div
						class="flex flex-1 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
					>
						<img src={result.output} alt="Preview" class="max-h-64 object-contain" />
					</div>
				{/if}

				<div class="relative min-h-[200px] flex-1">
					<Textarea
						readonly
						value={result.output}
						class="h-full w-full resize-none bg-slate-50 font-mono text-xs leading-relaxed dark:bg-slate-900"
					/>
				</div>
			</div>
		{:else}
			<div
				class="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
			>
				<p class="text-sm font-medium">Output will appear here</p>
			</div>
		{/if}
	</CardContent>
</Card>
