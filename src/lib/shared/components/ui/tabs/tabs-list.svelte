<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let { class: className = undefined, children } = $props();
</script>

<div
	class={cn(
		'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400',
		className
	)}
>
	{@render children?.()}
</div>
