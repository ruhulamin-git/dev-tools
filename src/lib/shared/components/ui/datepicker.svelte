<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface Props {
		class?: string;
		value?: string;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		onchange?: (e: Event) => void;
	}

	let {
		class: className,
		value = $bindable(),
		disabled = false,
		required = false,
		name = '',
		id = '',
		ariaLabel = '',
		ariaDescribedby = '',
		onchange
	}: Props = $props();
</script>

<input
	type="date"
	bind:value
	{disabled}
	{required}
	{name}
	id={id || undefined}
	aria-label={ariaLabel || undefined}
	aria-describedby={ariaDescribedby || undefined}
	class={cn(
		'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white',
		'focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:ring-offset-slate-950',
		'dark:focus-visible:ring-slate-300',
		'[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100',
		'[&::-webkit-calendar-picker-indicator]:dark:brightness-100 [&::-webkit-calendar-picker-indicator]:dark:invert',
		className
	)}
	{onchange}
/>
