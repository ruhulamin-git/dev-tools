<script lang="ts">
	import Textarea from '$lib/shared/components/ui/textarea.svelte';
	import Button from '$lib/shared/components/ui/button.svelte';

	interface Props {
		output: string;
		error: string;
	}

	let { output, error }: Props = $props();
	let copied = $state(false);

	const handleCopy = async () => {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {}
	};
</script>

{#if error}
	<div class="overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
		<div class="flex items-start gap-4">
			<div class="rounded-full bg-red-100 p-2 text-red-600">
				<!-- AlertCircle Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
						x1="12"
						y1="16"
						x2="12.01"
						y2="16"
					/></svg
				>
			</div>
			<div>
				<h3 class="mb-1 text-lg font-bold text-red-700">Error</h3>
				<p class="text-sm text-slate-700">{error}</p>
			</div>
		</div>
		<div class="mt-4 h-1 w-full bg-red-200"></div>
	</div>
{/if}

{#if output}
	<div class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
		<div class="relative p-4 sm:p-6">
			<div class="mb-3 flex items-center justify-between sm:mb-4">
				<div>
					<h3 class="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
						<!-- FileText Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-slate-500 dark:text-slate-400"
							><path
								d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
							/><polyline points="14 2 14 8 20 8" /></svg
						>
						Generated Text
					</h3>
					<span class="text-xs text-slate-500 dark:text-slate-400">{output.length.toLocaleString()} characters</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onclick={handleCopy}
					class="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600"
					aria-label="Copy output"
				>
					{#if copied}
						<!-- Check Icon -->
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
							class="text-green-600"><polyline points="20 6 9 17 4 12" /></svg
						>
						<span class="text-green-600">Copied!</span>
					{:else}
						<!-- Copy Icon -->
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
							class="text-slate-500 dark:text-slate-400"
							><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path
								d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
							/></svg
						>
						<span class="text-slate-700 dark:text-slate-300">Copy</span>
					{/if}
				</Button>
			</div>
			<div
				class="w-full rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
			>
				<pre class="font-inherit break-words whitespace-pre-wrap">{output}</pre>
			</div>
		</div>
	</div>
{/if}
