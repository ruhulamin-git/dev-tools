<script lang="ts">
	import type { DiffLine, DiffStats } from './types';
	import DiffLineRow from './DiffLine.svelte';
	import { syntaxHighlight, escapeHtml } from './diff-utils';

	interface Props {
		results: DiffLine[];
		stats: DiffStats;
		showResults: boolean;
		viewMode: 'unified' | 'side-by-side';
		onCopy: () => void;
	}

	let { results, stats, showResults, viewMode, onCopy }: Props = $props();

	const totalChanges = $derived(stats.additions + stats.deletions + stats.modifications);
	const hasChanges = $derived(totalChanges > 0);

	// For side-by-side view, we need to pair up lines
	interface SideBySideLine {
		left: {
			lineNum: number | null;
			content: string;
			type: 'unchanged' | 'deleted' | 'modified' | 'empty';
		};
		right: {
			lineNum: number | null;
			content: string;
			type: 'unchanged' | 'added' | 'modified' | 'empty';
		};
		charDiffs?: DiffLine['charDiffs'];
	}

	let sideBySideLines = $derived.by(() => {
		const lines: SideBySideLine[] = [];

		for (const result of results) {
			if (result.type === 'unchanged') {
				lines.push({
					left: { lineNum: result.originalLine, content: result.content, type: 'unchanged' },
					right: { lineNum: result.modifiedLine, content: result.content, type: 'unchanged' }
				});
			} else if (result.type === 'deleted') {
				lines.push({
					left: { lineNum: result.originalLine, content: result.content, type: 'deleted' },
					right: { lineNum: null, content: '', type: 'empty' }
				});
			} else if (result.type === 'added') {
				lines.push({
					left: { lineNum: null, content: '', type: 'empty' },
					right: { lineNum: result.modifiedLine, content: result.content, type: 'added' }
				});
			} else if (result.type === 'modified') {
				lines.push({
					left: {
						lineNum: result.originalLine,
						content: result.originalContent || '',
						type: 'modified'
					},
					right: {
						lineNum: result.modifiedLine,
						content: result.modifiedContent || '',
						type: 'modified'
					},
					charDiffs: result.charDiffs
				});
			}
		}

		return lines;
	});

	function renderCharDiffsForSide(charDiffs: DiffLine['charDiffs'], side: 'left' | 'right') {
		if (!charDiffs) return '';

		return charDiffs
			.map((diff) => {
				const escaped = escapeHtml(diff.text);
				if (diff.type === 'unchanged') {
					return escaped;
				} else if (diff.type === 'deleted' && side === 'left') {
					return `<mark class="bg-red-300/70 text-red-900 dark:bg-red-500/40 dark:text-red-200 rounded-sm px-0.5">${escaped}</mark>`;
				} else if (diff.type === 'added' && side === 'right') {
					return `<mark class="bg-green-300/70 text-green-900 dark:bg-green-500/40 dark:text-green-200 rounded-sm px-0.5">${escaped}</mark>`;
				} else if (diff.type === 'deleted' && side === 'right') {
					return '';
				} else if (diff.type === 'added' && side === 'left') {
					return '';
				}
				return escaped;
			})
			.join('');
	}
</script>

<!--
	Audited sinks below: every {@html} in this file renders output from either `syntaxHighlight`
	(diff-utils.ts) or `renderCharDiffsForSide` (this file's own function above), both of which
	escape `&`/`<`/`>`/`"`/`'` before any highlighting markup is added, and only ever wrap that
	escaped text in a hardcoded <span>/<mark> — see diff-utils.test.ts.
-->
<!-- eslint-disable svelte/no-at-html-tags -->
{#if showResults && results.length > 0}
	<div
		class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
	>
		<!-- Header -->
		<div
			class="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50"
		>
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
					>
						<svg
							class="h-4 w-4 text-blue-600 dark:text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<h2 class="text-sm font-bold text-slate-800 dark:text-slate-200">Comparison Results</h2>
				</div>

				<!-- Stats badges -->
				<div class="flex items-center gap-2">
					{#if stats.additions > 0}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400"
						>
							<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{stats.additions}
						</span>
					{/if}
					{#if stats.deletions > 0}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400"
						>
							<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{stats.deletions}
						</span>
					{/if}
					{#if stats.modifications > 0}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
						>
							<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
							{stats.modifications}
						</span>
					{/if}
					{#if !hasChanges}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400"
						>
							<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
							No changes
						</span>
					{/if}
				</div>
			</div>

			<button
				type="button"
				onclick={onCopy}
				class="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
				Copy Result
			</button>
		</div>

		<!-- Diff Content -->
		<div class="custom-scrollbar max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-auto">
			{#if viewMode === 'unified'}
				<!-- Unified View -->
				<div class="w-full overflow-x-auto">
					<div class="min-w-[320px] font-mono text-xs sm:text-[13px] leading-5 sm:leading-6">
						{#each results as line, index (index)}
							<DiffLineRow {line} />
						{/each}
					</div>
				</div>
			{:else}
				<!-- Side-by-Side View -->
				<div class="w-full overflow-x-auto">
					<div class="grid min-w-[640px] sm:min-w-[700px] lg:min-w-[800px] grid-cols-2 font-mono text-xs sm:text-[13px] leading-5 sm:leading-6">
					<!-- Left Panel Header -->
					<div
						class="sticky top-0 z-10 border-r border-b border-slate-200 bg-red-50 px-2 sm:px-4 py-2 text-xs font-semibold text-red-700 dark:border-slate-700 dark:bg-red-950/60 dark:text-red-400"
					>
						Original
					</div>
					<!-- Right Panel Header -->
					<div
						class="sticky top-0 z-10 border-b border-slate-200 bg-green-50 px-2 sm:px-4 py-2 text-xs font-semibold text-green-700 dark:border-slate-700 dark:bg-green-950/60 dark:text-green-400"
					>
						Modified
					</div>

					{#each sideBySideLines as row, index (index)}
						<!-- Left Side -->
						<div
							class="flex border-r border-b {row.left.type === 'deleted'
								? 'border-red-100 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/40'
								: row.left.type === 'modified'
									? 'border-red-100 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/40'
									: row.left.type === 'empty'
										? 'border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'
										: 'border-slate-100 dark:border-slate-700'}"
						>
							<div
								class="w-8 sm:w-10 flex-none px-1 sm:px-2 py-1 text-right text-xs select-none {row.left.type ===
									'deleted' || row.left.type === 'modified'
									? 'bg-red-100/50 text-red-600/70 dark:bg-red-950/60 dark:text-red-400/70'
									: row.left.type === 'empty'
										? 'bg-slate-100/50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600'
										: 'bg-slate-50/80 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500'}"
							>
								{row.left.lineNum ?? ''}
							</div>
							<div
								class="flex-1 px-2 sm:px-3 py-1 break-all whitespace-pre-wrap {row.left.type === 'deleted'
									? 'text-red-800 dark:text-red-300'
									: row.left.type === 'modified'
										? 'text-red-800 dark:text-red-300'
										: row.left.type === 'empty'
											? 'text-slate-300 dark:text-slate-600'
											: 'text-slate-700 dark:text-slate-300'}"
							>
								{#if row.left.type === 'modified' && row.charDiffs}
									{@html renderCharDiffsForSide(row.charDiffs, 'left')}
								{:else}
									{@html syntaxHighlight(row.left.content || ' ')}
								{/if}
							</div>
						</div>

						<!-- Right Side -->
						<div
							class="flex border-b {row.right.type === 'added'
								? 'border-green-100 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/40'
								: row.right.type === 'modified'
									? 'border-green-100 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/40'
									: row.right.type === 'empty'
										? 'border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'
										: 'border-slate-100 dark:border-slate-700'}"
						>
							<div
								class="w-8 sm:w-10 flex-none px-1 sm:px-2 py-1 text-right text-xs select-none {row.right.type ===
									'added' || row.right.type === 'modified'
									? 'bg-green-100/50 text-green-600/70 dark:bg-green-950/60 dark:text-green-400/70'
									: row.right.type === 'empty'
										? 'bg-slate-100/50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600'
										: 'bg-slate-50/80 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500'}"
							>
								{row.right.lineNum ?? ''}
							</div>
							<div
								class="flex-1 px-2 sm:px-3 py-1 break-all whitespace-pre-wrap {row.right.type === 'added'
									? 'text-green-800 dark:text-green-300'
									: row.right.type === 'modified'
										? 'text-green-800 dark:text-green-300'
										: row.right.type === 'empty'
											? 'text-slate-300 dark:text-slate-600'
											: 'text-slate-700 dark:text-slate-300'}"
							>
								{#if row.right.type === 'modified' && row.charDiffs}
									{@html renderCharDiffsForSide(row.charDiffs, 'right')}
								{:else}
									{@html syntaxHighlight(row.right.content || ' ')}
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
			{/if}
		</div>
	</div>
{:else if !showResults}
	<!-- Empty State -->
	<div
		class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white p-16 text-center dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50"
	>
		<div class="mb-6 rounded-2xl bg-slate-100 p-5 dark:bg-slate-700">
			<svg
				class="h-12 w-12 text-slate-400 dark:text-slate-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
				/>
			</svg>
		</div>
		<h2 class="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">Ready to Compare</h2>
		<p class="max-w-sm text-sm text-slate-500 dark:text-slate-400">
			Add text or upload files in both panels above, then click Compare to see the differences
			highlighted.
		</p>
		<div class="mt-6 flex items-center gap-6 text-xs text-slate-400">
			<div class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-red-200"></span>
				<span>Deleted</span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-green-200"></span>
				<span>Added</span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-amber-200"></span>
				<span>Modified</span>
			</div>
		</div>
	</div>
{/if}
