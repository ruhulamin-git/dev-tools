<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let { class: className = undefined, children } = $props();
</script>

<h2 class={cn('text-2xl leading-none font-semibold tracking-tight text-slate-900 dark:text-white', className)}>
	{@render children?.()}
</h2>
