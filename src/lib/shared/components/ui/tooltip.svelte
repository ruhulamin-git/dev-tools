<script lang="ts">
	import { cn } from '$lib/shared/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		class?: string;
		children?: Snippet;
	}

	let { text, class: className, children }: Props = $props();
	let showTooltip = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	function handleMouseEnter() {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			showTooltip = true;
		}, 200);
	}

	function handleMouseLeave() {
		if (timeoutId) clearTimeout(timeoutId);
		showTooltip = false;
	}
</script>

<div
	class={cn('relative inline-block', className)}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="presentation"
>
	{@render children?.()}
	{#if showTooltip}
		<div
			class="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-slate-800"
			role="tooltip"
		>
			{text}
			<div
				class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"
			></div>
		</div>
	{/if}
</div>
