<script lang="ts">
	import { onMount } from 'svelte';
	import { getNextRuns, type Dialect } from '../utils/cron';

	interface Props {
		expression: string;
		valid: boolean;
		dialect: Dialect;
		count?: number;
	}

	let { expression, valid, dialect, count = 5 }: Props = $props();

	// Every route in this repo is prerendered. Computing run times during render would
	// bake build-time dates into the static HTML, so the clock is only read in the
	// browser and the server pass renders a placeholder instead.
	let now = $state<Date | null>(null);
	let timezone = $state('');

	onMount(() => {
		now = new Date();
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	});

	$effect(() => {
		// A 30-second tick is enough for minute-precision schedules and avoids a needless
		// per-second timer — but it leaves a sub-minute countdown visibly stale, so the
		// seconds dialect gets the faster one. Re-runs, and clears up, when the dialect changes.
		const period = dialect === 'seconds' ? 1000 : 30_000;
		const id = window.setInterval(() => (now = new Date()), period);
		return () => clearInterval(id);
	});

	// The timezone stays the visitor's own; the dialect only changes how the fields are read.
	const runs = $derived(
		valid && now ? getNextRuns(expression, now, count, undefined, dialect) : []
	);

	// Seconds are only shown where the dialect can schedule them — without this, a 30-second
	// schedule lists two consecutive runs that both read "07:19 PM" and look like a bug.
	const formatter = $derived(
		new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: dialect === 'seconds' ? '2-digit' : undefined,
			hour12: true
		})
	);

	function relative(date: Date, from: Date): string {
		const seconds = Math.round((date.getTime() - from.getTime()) / 1000);
		// Counting the seconds down only helps where seconds can be scheduled; elsewhere the
		// list refreshes too slowly for a number that precise to stay true.
		if (seconds < 60) {
			return dialect === 'seconds'
				? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(seconds, 'second')
				: 'in less than a minute';
		}

		const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
			['year', 31_536_000],
			['month', 2_592_000],
			['day', 86_400],
			['hour', 3600],
			['minute', 60]
		];
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

		for (const [unit, size] of units) {
			if (Math.abs(seconds) >= size) {
				return rtf.format(Math.round(seconds / size), unit);
			}
		}
		return rtf.format(seconds, 'second');
	}
</script>

<section aria-labelledby="next-runs-heading">
	<div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
		<h2 id="next-runs-heading" class="text-sm font-semibold text-slate-900 dark:text-slate-100">
			Next {count} run times
		</h2>
		{#if timezone}
			<span class="text-xs text-slate-500 dark:text-slate-400">
				Your local time · {timezone}
			</span>
		{/if}
	</div>

	{#if !valid}
		<p class="text-sm text-slate-500 dark:text-slate-400">
			Enter a valid expression to preview when it runs.
		</p>
	{:else if !now}
		<!-- Server-rendered placeholder; replaced on mount. -->
		<p class="text-sm text-slate-500 dark:text-slate-400">Calculating…</p>
	{:else if runs.length === 0}
		<p class="text-sm text-slate-500 dark:text-slate-400">
			This expression never matches a real date.
		</p>
	{:else}
		<ol class="space-y-1.5">
			{#each runs as run, index (run.getTime())}
				<li
					class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<span class="flex items-baseline gap-3">
						<span
							class="font-mono text-xs text-slate-400 tabular-nums dark:text-slate-500"
							aria-hidden="true"
						>
							{index + 1}
						</span>
						<time
							datetime={run.toISOString()}
							class="font-mono text-sm text-slate-900 tabular-nums dark:text-slate-100"
						>
							{formatter.format(run)}
						</time>
					</span>
					<span class="text-xs text-slate-500 dark:text-slate-400">
						{relative(run, now)}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
