<script lang="ts">
	import { DIALECTS, DIALECT_ORDER, type Dialect } from '../utils/cron';

	interface Props {
		value: Dialect;
		/** A callback rather than a binding: switching dialect may rewrite the expression too. */
		onchange: (next: Dialect) => void;
	}

	let { value, onchange }: Props = $props();
</script>

<fieldset>
	<legend class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Dialect</legend>

	<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Cron dialect">
		{#each DIALECT_ORDER as id (id)}
			{@const spec = DIALECTS[id]}
			{@const selected = value === id}
			<button
				type="button"
				role="radio"
				aria-checked={selected}
				onclick={() => onchange(id)}
				class="cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900 {selected
					? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30'
					: 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20'}"
			>
				<span
					class="block text-sm font-semibold {selected
						? 'text-blue-900 dark:text-blue-200'
						: 'text-slate-900 dark:text-slate-100'}"
				>
					{spec.label}
				</span>
				<span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{spec.note}</span>
			</button>
		{/each}
	</div>
</fieldset>
