<script lang="ts">
	import type { CronExample } from '../utils/examples';

	interface Props {
		current: string;
		/** The set for the selected dialect — a Unix expression is not valid EventBridge. */
		examples: CronExample[];
		/** Short dialect name, so it is clear which syntax these are written in. */
		dialectLabel: string;
		onselect: (expression: string) => void;
	}

	let { current, examples, dialectLabel, onselect }: Props = $props();
</script>

<section aria-labelledby="examples-heading">
	<h2
		id="examples-heading"
		class="mb-3 flex items-baseline gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
	>
		Common expressions
		<span class="text-xs font-normal text-slate-500 dark:text-slate-400">{dialectLabel}</span>
	</h2>

	<ul class="grid gap-2 sm:grid-cols-2">
		{#each examples as example (example.expression)}
			{@const isCurrent = example.expression === current.trim()}
			<li>
				<button
					type="button"
					onclick={() => onselect(example.expression)}
					aria-current={isCurrent ? 'true' : undefined}
					class="flex w-full items-baseline gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900 {isCurrent
						? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30'
						: 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800'}"
				>
					<code class="shrink-0 font-mono text-sm font-medium text-blue-700 dark:text-blue-400"
						>{example.expression}</code
					>
					<span class="text-xs text-slate-600 dark:text-slate-400">{example.label}</span>
				</button>
			</li>
		{/each}
	</ul>
</section>
