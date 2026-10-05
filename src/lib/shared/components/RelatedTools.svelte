<script lang="ts">
	/**
	 * Zeigarnik effect / goal-gradient: a visitor who just finished one step (formatted their
	 * JSON, hashed their text) is primed to keep going, not done — "next tool" is exactly what
	 * lets that momentum turn into a chain of tools used in one session instead of one.
	 */
	import { base } from '$app/paths';
	import { getRelatedTools, getToolUrl, type Tool } from '$lib/shared/config/tools';
	import { track } from '$lib/shared/analytics/track';

	interface Props {
		tool: Tool;
		/** Shown above the list; defaults to a generic prompt, but a page can make it specific
		 *  ("Next: validate it → JSON Formatter") when there's an obvious next step. */
		heading?: string;
	}

	const { tool, heading = 'Related tools' }: Props = $props();

	const related = $derived(getRelatedTools(tool));

	function handleClick(target: Tool) {
		track('related_tool_click', { tool: tool.slug, label: target.slug });
	}
</script>

{#if related.length > 0}
	<nav class="mt-10 border-t border-slate-700 pt-8" aria-label={heading}>
		<h2 class="mb-4 text-lg font-semibold text-slate-100">{heading}</h2>
		<div class="flex flex-wrap gap-3">
			{#each related as target (target.slug)}
				<a
					href={getToolUrl(target, base)}
					onclick={() => handleClick(target)}
					class="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-2 pr-4 pl-3 text-sm font-medium text-slate-100 transition-colors hover:border-devx-yellow/40 hover:bg-slate-700"
				>
					{target.name}
					<svg
						class="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-devx-yellow"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>
			{/each}
		</div>
	</nav>
{/if}
