<script lang="ts">
	import type { FieldInfo, SyntaxRow } from '../utils/cron';

	interface Props {
		fields: FieldInfo[];
		/** Index of the field the caret sits in, or -1 for none. */
		activeIndex: number;
		/**
		 * False when the fields shown are a macro's expansion — those values appear nowhere in
		 * the text the visitor typed, so there is nothing in the input to select.
		 */
		selectable: boolean;
		/** The selected field's syntax legend, or null when no field is selected. */
		detail: FieldDetail | null;
		onselect: (index: number) => void;
	}

	interface FieldDetail {
		label: string;
		value: string;
		/** Everything this field accepts. Static — it describes the syntax, not the input. */
		syntax: SyntaxRow[];
		/** Rows in the dialect's longest legend, so the panel holds one steady height. */
		rows: number;
		/** What the typed value resolves to, or null while the expression is invalid. */
		matches: { labels: string[]; all: boolean } | null;
		range: string;
	}

	let { fields, activeIndex, selectable, detail, onselect }: Props = $props();
</script>

<!-- Column count follows the dialect: five fields for Unix, six for the others. -->
<div
	class="grid grid-cols-2 gap-2 sm:grid-cols-3 {fields.length === 6
		? 'lg:grid-cols-6'
		: 'lg:grid-cols-5'}"
>
	{#each fields as field, index (field.name)}
		<button
			type="button"
			disabled={!selectable || !field.value}
			onclick={() => onselect(index)}
			aria-label="Select the {field.label.toLowerCase()} field"
			class="rounded-lg border p-3 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none enabled:cursor-pointer disabled:cursor-default dark:focus-visible:ring-offset-slate-900 {index ===
			activeIndex
				? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30'
				: 'border-slate-200 bg-slate-50 enabled:hover:border-blue-300 enabled:hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800/50 dark:enabled:hover:border-blue-500/50 dark:enabled:hover:bg-blue-900/20'}"
		>
			<div
				class="mb-1 font-mono text-lg font-semibold break-all {field.value
					? 'text-slate-900 dark:text-slate-100'
					: 'text-slate-300 dark:text-slate-600'}"
			>
				{field.value || '–'}
			</div>
			<div class="text-xs font-medium text-slate-600 dark:text-slate-400">
				{field.label}
			</div>
			<div class="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
				{field.range}
			</div>
		</button>
	{/each}
</div>

{#if detail}
	<!-- What this field accepts, in the manner of crontab.guru's per-field legend. Shown for
	     the selected field whether or not the expression parses, since it is exactly what you
	     want in front of you while fixing a field you got wrong. -->
	<div
		class="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900/50 dark:bg-blue-900/20"
	>
		<p class="text-xs font-medium text-slate-600 dark:text-slate-400">
			Allowed in <span class="text-slate-900 dark:text-slate-100">{detail.label}</span>
		</p>

		<!-- Held at the height of the dialect's longest legend so moving between fields swaps the
		     rows in place instead of resizing the panel and shifting the page. Each row is one
		     text-xs line (1rem) plus the 0.25rem gap from space-y-1. -->
		<dl class="mt-2 space-y-1" style:min-height="{detail.rows * 1.25}rem">
			{#each detail.syntax as row (row.token)}
				<div class="flex items-baseline gap-3">
					<dt
						class="w-20 shrink-0 text-right font-mono text-xs font-semibold text-slate-900 dark:text-slate-100"
					>
						{row.token}
					</dt>
					<dd class="text-xs text-slate-600 dark:text-slate-400">{row.meaning}</dd>
				</div>
			{/each}
		</dl>

		{#if detail.matches && detail.value}
			<p
				class="mt-3 border-t border-blue-200 pt-2 text-xs text-slate-600 dark:border-blue-900/50 dark:text-slate-400"
			>
				<code class="font-mono font-semibold text-slate-900 dark:text-slate-100"
					>{detail.value}</code
				>
				matches
				{#if detail.matches.all}
					every value in {detail.range}
				{:else}
					<span class="font-mono text-slate-900 dark:text-slate-100"
						>{detail.matches.labels.join(', ')}</span
					>
				{/if}
			</p>
		{/if}
	</div>
{/if}
