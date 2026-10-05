<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/shared/utils';
	import type { Writable } from 'svelte/store';

	let { value, children, class: className = undefined } = $props();
	const activeValue = getContext<Writable<string>>('tabs');
</script>

<button
	type="button"
	class={cn(
		'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm',
		className
	)}
	data-state={$activeValue === value ? 'active' : 'inactive'}
	onclick={() => activeValue.set(value)}
>
	{@render children?.()}
</button>
