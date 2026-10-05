<script lang="ts">
	/**
	 * Risk reduction, above the fold: the anxiety a first-time visitor to a "paste your data
	 * here" tool actually has is "what happens to what I type" — this answers it before they
	 * have to wonder, in four words each, rather than making them read a privacy policy.
	 * Every claim here is something this app's own architecture already guarantees (fully
	 * client-side tools, static hosting, no accounts anywhere on the site) — never a claim to
	 * verify per-tool.
	 */
	const items = [
		{ label: 'Runs locally' },
		{ label: 'No sign-up' },
		{ label: 'No upload' },
		{ label: 'Free forever' }
	];
</script>

<ul class="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Why this tool is safe to use">
	{#each items as item (item.label)}
		<li class="flex items-center gap-1.5 text-sm text-slate-400">
			<svg
				class="h-4 w-4 shrink-0 text-emerald-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				/>
			</svg>
			{item.label}
		</li>
	{/each}
</ul>
