<script lang="ts">
	import { cn } from '$lib/shared/utils';
	import { syntaxHighlightJson } from './utils/highlight';

	interface Props {
		value: string;
		placeholder?: string;
		readonly?: boolean;
		error?: { line?: number; column?: number; message?: string } | null;
		onInput?: (value: string) => void;
		class?: string;
	}

	let {
		value = $bindable(),
		placeholder = 'Paste your JSON here...',
		readonly = false,
		error = null,
		onInput,
		class: className
	}: Props = $props();

	// Element refs for scroll sync
	let lineNumbersEl: HTMLDivElement;
	let highlightEl: HTMLPreElement;

	let lineNumbers = $derived.by(() => {
		const lines = (value || '').split('\n').length;
		return Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1);
	});

	// Syntax highlighting
	let highlightedHtml = $derived.by(() => {
		if (!value || !value.trim()) return '';
		return syntaxHighlightJson(value);
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onInput?.(target.value);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			const target = e.target as HTMLTextAreaElement;
			const start = target.selectionStart;
			const end = target.selectionEnd;
			value = value.substring(0, start) + '  ' + value.substring(end);
			setTimeout(() => {
				target.selectionStart = target.selectionEnd = start + 2;
			}, 0);
		}
	}

	function handleScroll(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		if (highlightEl) {
			highlightEl.scrollTop = target.scrollTop;
			highlightEl.scrollLeft = target.scrollLeft;
		}
		if (lineNumbersEl) {
			lineNumbersEl.scrollTop = target.scrollTop;
		}
	}
</script>

<div class={cn('relative flex h-[400px] bg-white dark:bg-slate-800', className)}>
	<!-- Line Numbers -->
	<div
		bind:this={lineNumbersEl}
		class="shrink-0 overflow-hidden bg-gray-50 px-3 py-3 text-right font-mono text-xs text-gray-600 select-none dark:bg-slate-900 dark:text-slate-400"
		style="min-width: 50px;"
	>
		{#each lineNumbers as num}
			<div
				class={cn(
					'h-5 leading-5',
					error?.line === num &&
						'-mx-3 bg-red-100 px-3 font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400'
				)}
			>
				{num}
			</div>
		{/each}
	</div>

	<!-- Editor Container -->
	<div class="relative flex-1 overflow-hidden">
		<!-- Syntax Highlighted Layer (behind) -->
		<!--
			Audited sink: `syntaxHighlightJson` (components/utils/highlight.ts, covered by
			highlight.test.ts) escapes `&`/`<`/`>` before any highlighting runs, and every span
			it inserts uses a hardcoded class string, never one built from the input — so no
			input can reintroduce a raw `<`/`>`/`&`.
		-->
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre
			bind:this={highlightEl}
			class="pointer-events-none absolute inset-0 m-0 overflow-auto p-3 font-mono text-sm leading-5 break-words whitespace-pre-wrap text-slate-900 dark:text-slate-100"
			aria-hidden="true">{#if highlightedHtml}{@html highlightedHtml}{:else}<span
					class="text-gray-500 dark:text-slate-400">{placeholder}</span
				>{/if}</pre>
		<!-- eslint-enable svelte/no-at-html-tags -->

		<!-- Textarea (on top, transparent text) -->
		<textarea
			bind:value
			{placeholder}
			{readonly}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			onscroll={handleScroll}
			spellcheck="false"
			class={cn(
				'absolute inset-0 h-full w-full resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-5 caret-gray-900 outline-none dark:caret-slate-100',
				'placeholder:text-gray-500 dark:placeholder:text-slate-400',
				readonly && 'cursor-default',
				'focus:ring-0 focus:outline-none'
			)}
			style="color: transparent; border: none !important; box-shadow: none !important;"
		></textarea>
	</div>
</div>
