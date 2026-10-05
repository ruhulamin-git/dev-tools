<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface Props {
		class?: string;
		checked?: boolean;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		onchange?: (e: Event) => void;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		class: className,
		checked = $bindable(false),
		disabled = false,
		required = false,
		name = '',
		id = '',
		ariaLabel = '',
		ariaDescribedby = '',
		onchange,
		onclick
	}: Props = $props();

	let inputElement: HTMLInputElement;
</script>

<input
	bind:this={inputElement}
	type="checkbox"
	bind:checked
	{disabled}
	{required}
	{name}
	{id}
	aria-label={ariaLabel}
	aria-describedby={ariaDescribedby}
	class={cn(
		'h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus:ring-slate-400',
		className
	)}
	{onchange}
	{onclick}
/>
