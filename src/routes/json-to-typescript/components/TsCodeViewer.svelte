<script lang="ts">
	import { highlightTs } from './highlightTs';

	interface Props {
		code: string;
		placeholder?: string;
	}

	let { code, placeholder = 'TypeScript will appear here...' }: Props = $props();

	let lines = $derived(code.split('\n'));
	let highlightedHtml = $derived(highlightTs(code));
</script>

<div class="relative flex h-full bg-white dark:bg-slate-800">
	{#if !code.trim()}
		<div
			class="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-slate-400"
		>
			{placeholder}
		</div>
	{:else}
		<!-- Line Numbers -->
		<div
			class="shrink-0 overflow-hidden bg-gray-50 px-3 py-3 text-right font-mono text-xs text-gray-600 select-none dark:bg-slate-900 dark:text-slate-400"
			style="min-width: 50px;"
		>
			{#each lines as _, i}
				<div class="h-5 leading-5">{i + 1}</div>
			{/each}
		</div>

		<!-- Code Content -->
		<div class="custom-scrollbar flex-1 overflow-auto">
			<!--
				Audited sink: `highlightTs` (highlightTs.ts, covered by highlightTs.test.ts)
				escapes `&`/`<`/`>` before any highlighting runs, and every span it inserts uses
				a hardcoded class string, never one built from the input.
			-->
			<!-- eslint-disable svelte/no-at-html-tags -->
			<pre
				class="m-0 p-3 font-mono text-sm leading-5 whitespace-pre-wrap text-slate-900 dark:text-slate-100">{@html highlightedHtml}</pre>
			<!-- eslint-enable svelte/no-at-html-tags -->
		</div>
	{/if}
</div>
