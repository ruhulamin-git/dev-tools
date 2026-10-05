<script lang="ts">
	interface Props {
		color?: string;
		class?: string;
	}

	let { color = '#111827', class: className = 'h-6 w-6 animate-spin' }: Props = $props();
</script>

<svg
	aria-hidden="true"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	class={className}
>
	<circle cx="12" cy="12" r="10" stroke={color} stroke-opacity="0.15" stroke-width="4" />
	<path d="M22 12a10 10 0 0 1-10 10" stroke={color} stroke-width="4" stroke-linecap="round" />
</svg>
