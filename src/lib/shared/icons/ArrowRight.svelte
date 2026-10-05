<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<svg class={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M13 7l5 5m0 0l-5 5m5-5H6"
	/>
</svg>
