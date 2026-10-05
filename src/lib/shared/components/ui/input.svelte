<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface Props {
		class?: string;
		value?: string | number;
		type?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		readonly?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		step?: string | number;
		min?: string | number;
		max?: string | number;
		onblur?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: Event) => void;
		oninput?: (e: Event) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onkeyup?: (e: KeyboardEvent) => void;
		onmousedown?: (e: MouseEvent) => void;
		onmouseup?: (e: MouseEvent) => void;
		onpaste?: (e: ClipboardEvent) => void;
		onselect?: (e: Event) => void;
	}

	let {
		class: className,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		disabled = false,
		required = false,
		readonly = false,
		name = '',
		id = '',
		ariaLabel = '',
		ariaDescribedby = '',
		step,
		min,
		max,
		onblur,
		onchange,
		onfocus,
		oninput,
		onkeydown,
		onkeyup,
		onmousedown,
		onmouseup,
		onpaste,
		onselect
	}: Props = $props();
</script>

<input
	{type}
	bind:value
	{placeholder}
	{disabled}
	{required}
	{readonly}
	{name}
	{id}
	{step}
	{min}
	{max}
	aria-label={ariaLabel}
	aria-describedby={ariaDescribedby}
	class={cn(
		'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:ring-2! focus-visible:ring-blue-500! focus-visible:ring-offset-2! focus-visible:ring-offset-white! focus-visible:outline-none! disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-500! dark:focus-visible:ring-offset-slate-950!',
		className
	)}
	{onblur}
	{onchange}
	{onfocus}
	{oninput}
	{onkeydown}
	{onkeyup}
	{onmousedown}
	{onmouseup}
	{onpaste}
	{onselect}
/>
