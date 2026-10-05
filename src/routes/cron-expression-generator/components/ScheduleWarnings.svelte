<script lang="ts">
	import { TriangleAlert } from '@lucide/svelte';
	import type { ScheduleWarning } from '../utils/lint';

	interface Props {
		warnings: ScheduleWarning[];
	}

	let { warnings }: Props = $props();
</script>

{#if warnings.length > 0}
	<!-- Amber, not red: every expression that gets here is valid cron. These are schedules
	     that run differently from how they read, which is a different thing from an error. -->
	<div
		class="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20"
		role="note"
		aria-label="Schedule warnings"
	>
		<ul class="space-y-3">
			{#each warnings as warning (warning.id)}
				<li class="flex gap-3">
					<TriangleAlert
						class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500"
						aria-hidden="true"
					/>
					<div>
						<p class="text-sm font-semibold text-amber-900 dark:text-amber-200">
							{warning.title}
						</p>
						<p class="mt-0.5 text-sm leading-relaxed text-amber-800 dark:text-amber-300/90">
							{warning.detail}
						</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
{/if}
