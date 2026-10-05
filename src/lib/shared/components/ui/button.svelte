<script lang="ts">
	import { cn } from '$lib/shared/utils';
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
	type Size = 'default' | 'sm' | 'lg' | 'icon';

	interface Props {
		class?: string;
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		'aria-label'?: string;
		children?: Snippet;
		[key: string]: any;
	}

	const baseStyles =
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300';

	const variants: Record<Variant, string> = {
		default:
			'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700',
		secondary:
			'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
		destructive: 'bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600',
		outline:
			'border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
		ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100',
		link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50'
	};

	const sizes: Record<Size, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};

	let {
		class: className,
		variant = 'default',
		size = 'default',
		disabled = false,
		type = 'button',
		onclick,
		'aria-label': ariaLabel,
		children,
		...rest
	}: Props = $props();

	function handleClick(e: MouseEvent) {
		if (onclick && !disabled) {
			onclick(e);
		}
	}

	// Ensure button has accessible name
	// Children provide accessible name, or aria-label must be provided
	// For icon buttons without children, aria-label is required
	let hasChildren = $derived(!!children);
	// Only use aria-label if provided, or if it's an icon button without children
	// If children exist, they provide the accessible name
	let accessibleLabel = $derived(
		hasChildren ? ariaLabel : ariaLabel || (size === 'icon' ? 'Button' : undefined)
	);
</script>

<button
	{type}
	{disabled}
	class={cn(baseStyles, variants[variant], sizes[size], !disabled && 'cursor-pointer', className)}
	onclick={handleClick}
	{...accessibleLabel ? { 'aria-label': accessibleLabel } : {}}
	{...rest}
>
	{@render children?.()}
</button>
