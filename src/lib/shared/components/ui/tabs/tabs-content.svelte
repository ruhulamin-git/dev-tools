<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/shared/utils';
	import type { Writable } from 'svelte/store';

	let { value, children, class: className = undefined } = $props();
	const activeValue = getContext<Writable<string>>('tabs');
</script>

{#if $activeValue === value}
	<div
		class={cn(
			'mt-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
			className
		)}
	>
		{@render children?.()}
	</div>
{/if}
