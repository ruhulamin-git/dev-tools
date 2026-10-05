<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface Props {
		class?: string;
		value?: number;
		min?: number | string;
		max?: number | string;
		step?: number | string;
		disabled?: boolean;
		oninput?: (e: Event) => void;
		id?: string;
		ariaLabel?: string;
	}

	let {
		class: className,
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		oninput,
		id = '',
		ariaLabel = ''
	}: Props = $props();

	let minNum = $derived(typeof min === 'string' ? parseFloat(min) : min);
	let maxNum = $derived(typeof max === 'string' ? parseFloat(max) : max);
	let stepNum = $derived(typeof step === 'string' ? parseFloat(step) : step);
</script>

<input
	type="range"
	bind:value
	min={minNum}
	max={maxNum}
	step={stepNum}
	{disabled}
	{id}
	aria-label={ariaLabel}
	class={cn(
		'flex h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-800',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
	style="background: linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) {((value -
		minNum) /
		(maxNum - minNum)) *
		100}%, rgb(226 232 240) {((value - minNum) / (maxNum - minNum)) *
		100}%, rgb(226 232 240) 100%);"
	{oninput}
/>

<style>
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		height: 1rem;
		width: 1rem;
		border-radius: 9999px;
		background: rgb(59 130 246);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	input[type='range']::-moz-range-thumb {
		height: 1rem;
		width: 1rem;
		border-radius: 9999px;
		background: rgb(59 130 246);
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
</style>
