<script lang="ts">
	interface Props {
		circleColor?: string;
		class?: string;
	}

	let { circleColor = '#374151', class: className = 'size-5 shrink-0' }: Props = $props();
</script>

<svg
	aria-hidden="true"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 20 20"
	fill="none"
	class={className}
>
	<circle cx="10" cy="10" r="10" fill={circleColor} />
	<path
		d="M6 10.5L8.5 13L14 7.5"
		stroke="white"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
