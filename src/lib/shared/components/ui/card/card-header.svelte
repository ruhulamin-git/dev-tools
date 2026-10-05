<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let { class: className = undefined, children } = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 p-6', className)}>
	{@render children?.()}
</div>
