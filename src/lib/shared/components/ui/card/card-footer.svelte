<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let { class: className = undefined, children } = $props();
</script>

<div class={cn('flex items-center p-6 pt-0', className)}>
	{@render children?.()}
</div>
