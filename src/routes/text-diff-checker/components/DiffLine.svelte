<script lang="ts">
	import type { DiffLine as DiffLineType } from './types';
	import { syntaxHighlight, escapeHtml } from './diff-utils';

	interface Props {
		line: DiffLineType;
	}

	let { line }: Props = $props();

	function renderCharDiffs(charDiffs: DiffLineType['charDiffs'], mode: 'deleted' | 'added') {
		if (!charDiffs) return '';

		return charDiffs
			.map((diff) => {
				const escaped = escapeHtml(diff.text);
				if (diff.type === 'unchanged') {
					return escaped;
				} else if (diff.type === 'deleted' && mode === 'deleted') {
					return `<mark class="bg-red-300/70 text-red-900 rounded-sm px-0.5 -mx-0.5">${escaped}</mark>`;
				} else if (diff.type === 'added' && mode === 'added') {
					return `<mark class="bg-green-300/70 text-green-900 rounded-sm px-0.5 -mx-0.5">${escaped}</mark>`;
				} else if (diff.type === 'deleted' && mode === 'added') {
					return '';
				} else if (diff.type === 'added' && mode === 'deleted') {
					return '';
				}
				return escaped;
			})
			.join('');
	}

	const lineNumWidth = 'w-8 sm:w-10 lg:w-12';
</script>

<!--
	Audited sinks below: every {@html} in this file renders output from either `syntaxHighlight`
	or `renderCharDiffs` (diff-utils.ts / this file's own function above), both of which escape
	`&`/`<`/`>`/`"`/`'` before any highlighting markup is added, and only ever wrap that escaped
	text in a hardcoded <span>/<mark> — see diff-utils.test.ts.
-->
<!-- eslint-disable svelte/no-at-html-tags -->
{#if line.type === 'unchanged'}
	<div class="group flex border-b border-slate-100 transition-colors hover:bg-slate-50" role="row">
		<div
			class="{lineNumWidth} flex-none border-r border-slate-100 bg-slate-50/80 px-1 sm:px-2 py-1 text-right text-xs text-slate-400 select-none"
		>
			{line.originalLine}
		</div>
		<div
			class="{lineNumWidth} flex-none border-r border-slate-100 bg-slate-50/80 px-1 sm:px-2 py-1 text-right text-xs text-slate-400 select-none"
		>
			{line.modifiedLine}
		</div>
		<div
			class="w-4 sm:w-6 flex-none border-r border-slate-100 bg-slate-50/50 text-center text-slate-300 select-none"
		></div>
		<div class="flex-1 px-2 sm:px-4 py-1 break-all whitespace-pre-wrap text-slate-700">
			{@html syntaxHighlight(line.content || ' ')}
		</div>
	</div>
{:else if line.type === 'deleted'}
	<div
		class="group flex border-b border-red-100 bg-red-50/60 transition-colors hover:bg-red-100/60"
		role="row"
	>
		<div
			class="{lineNumWidth} flex-none border-r border-red-100 bg-red-100/50 px-1 sm:px-2 py-1 text-right text-xs text-red-600/70 select-none"
		>
			{line.originalLine}
		</div>
		<div
			class="{lineNumWidth} flex-none border-r border-red-100 bg-red-100/50 px-1 sm:px-2 py-1 text-right text-xs text-slate-400 select-none"
		></div>
		<div
			class="w-4 sm:w-6 flex-none border-r border-red-100 bg-red-100/30 text-center font-bold text-red-500 select-none"
		>
			−
		</div>
		<div class="flex-1 px-2 sm:px-4 py-1 break-all whitespace-pre-wrap text-red-800">
			{@html syntaxHighlight(line.content || ' ')}
		</div>
	</div>
{:else if line.type === 'added'}
	<div
		class="group flex border-b border-green-100 bg-green-50/60 transition-colors hover:bg-green-100/60"
		role="row"
	>
		<div
			class="{lineNumWidth} flex-none border-r border-green-100 bg-green-100/50 px-1 sm:px-2 py-1 text-right text-xs text-slate-400 select-none"
		></div>
		<div
			class="{lineNumWidth} flex-none border-r border-green-100 bg-green-100/50 px-1 sm:px-2 py-1 text-right text-xs text-green-600/70 select-none"
		>
			{line.modifiedLine}
		</div>
		<div
			class="w-4 sm:w-6 flex-none border-r border-green-100 bg-green-100/30 text-center font-bold text-green-500 select-none"
		>
			+
		</div>
		<div class="flex-1 px-2 sm:px-4 py-1 break-all whitespace-pre-wrap text-green-800">
			{@html syntaxHighlight(line.content || ' ')}
		</div>
	</div>
{:else if line.type === 'modified'}
	<!-- Deleted part of modified line -->
	<div
		class="group flex border-b border-red-100 bg-red-50/60 transition-colors hover:bg-red-100/60"
		role="row"
	>
		<div
			class="{lineNumWidth} flex-none border-r border-red-100 bg-red-100/50 px-1 sm:px-2 py-1 text-right text-xs text-red-600/70 select-none"
		>
			{line.originalLine}
		</div>
		<div
			class="{lineNumWidth} flex-none border-r border-red-100 bg-red-100/50 px-1 sm:px-2 py-1 text-right text-xs text-slate-400 select-none"
		></div>
		<div
			class="w-4 sm:w-6 flex-none border-r border-red-100 bg-red-100/30 text-center font-bold text-red-500 select-none"
		>
			−
		</div>
		<div class="flex-1 px-2 sm:px-4 py-1 break-all whitespace-pre-wrap text-red-800">
			{@html renderCharDiffs(line.charDiffs, 'deleted')}
		</div>
	</div>
	<!-- Added part of modified line -->
	<div
		class="group flex border-b border-green-100 bg-green-50/60 transition-colors hover:bg-green-100/60"
		role="row"
	>
		<div
			class="{lineNumWidth} flex-none border-r border-green-100 bg-green-100/50 px-1 sm:px-2 py-1 text-right text-xs text-slate-400 select-none"
		></div>
		<div
			class="{lineNumWidth} flex-none border-r border-green-100 bg-green-100/50 px-1 sm:px-2 py-1 text-right text-xs text-green-600/70 select-none"
		>
			{line.modifiedLine}
		</div>
		<div
			class="w-4 sm:w-6 flex-none border-r border-green-100 bg-green-100/30 text-center font-bold text-green-500 select-none"
		>
			+
		</div>
		<div class="flex-1 px-2 sm:px-4 py-1 break-all whitespace-pre-wrap text-green-800">
			{@html renderCharDiffs(line.charDiffs, 'added')}
		</div>
	</div>
{/if}
