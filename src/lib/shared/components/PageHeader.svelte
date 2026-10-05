<script lang="ts">
	interface Props {
		title: string;
		description: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="mb-6 text-center sm:mb-8">
	<h1 class="mb-3 text-3xl font-bold text-slate-100 sm:mb-4 sm:text-4xl">
		{title}
	</h1>
	<p class="mx-auto  text-base text-slate-200 sm:text-lg">
		{description}
	</p>
</div>
