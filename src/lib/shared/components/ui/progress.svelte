<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let { value = 0, max = 100, class: className = undefined, ...rest } = $props();
</script>

<div
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value}
	class={cn(
		'relative h-4 w-full overflow-hidden rounded-full bg-slate-100',
		className
	)}
>
	<div
		class="h-full w-full flex-1 bg-slate-900 transition-all"
		style="transform: translateX(-{100 - (value || 0)}%)"
	></div>
</div>
