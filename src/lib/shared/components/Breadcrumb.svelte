<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
		class?: string;
	}

	let { items, class: className }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class={cn('flex', className)}>
	<ol class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
		{#each items as item, index}
			<li class="flex items-center gap-1.5">
				{#if index > 0}
					<span class="text-gray-400 dark:text-gray-500">/</span>
				{/if}
				{#if item.href && index < items.length - 1}
					<a
						href={item.href}
						class="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
					>
						{item.label}
					</a>
				{:else}
					<span class="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
