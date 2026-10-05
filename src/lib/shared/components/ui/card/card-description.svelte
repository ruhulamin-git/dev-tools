<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let { class: className = undefined, children } = $props();
</script>

<p class={cn('text-sm text-slate-600 dark:text-slate-400', className)}>
	{@render children?.()}
</p>
