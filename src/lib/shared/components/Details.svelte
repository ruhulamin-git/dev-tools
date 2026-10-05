<script lang="ts">
	interface Props {
		title?: string;
		subtitle?: string;
	}

	const { title = '', subtitle = '' }: Props = $props();
</script>

{#if title || subtitle}
	<section class="relative mt-10 overflow-hidden border-t border-slate-300 dark:border-slate-800">
		<div class="relative mx-auto max-w-4xl px-4 pt-10 text-center sm:px-6 lg:px-8">
			{#if title}
				<p class="text-base font-medium text-slate-700 dark:text-slate-200">
					{title}
				</p>
			{/if}
			{#if subtitle}
				<p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
					{subtitle}
				</p>
			{/if}
		</div>
	</section>
{/if}
