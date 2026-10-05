<script lang="ts">
	import { tick } from 'svelte';
	import { cn } from '$lib/shared/utils';

	interface Option {
		value: string | number;
		label: string;
	}

	interface Props {
		class?: string;
		value?: string | number;
		options?: Option[];
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		name?: string;
		id?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		searchable?: boolean;
		onblur?: (e: Event) => void;
		onchange?: (value: string | number) => void;
		onfocus?: (e: Event) => void;
	}

	let {
		class: className,
		value = $bindable(),
		options = [],
		placeholder = 'Select...',
		disabled = false,
		name = '',
		id = '',
		ariaLabel = '',
		searchable = false,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let searchInput: HTMLInputElement | undefined = $state();

	let selectedLabel = $derived(options.find((opt) => opt.value === value)?.label || placeholder);

	let filteredOptions = $derived(
		searchable
			? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
			: options
	);

	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
			if (isOpen) {
				searchQuery = ''; // Reset search on open
			}
		}
	}

	$effect(() => {
		if (isOpen && searchable) {
			void tick().then(() => {
				searchInput?.focus();
			});
		}
	});

	function selectOption(opt: Option) {
		value = opt.value;
		isOpen = false;
		onchange?.(opt.value);
	}

	let container: HTMLDivElement;

	function handleClickOutside(event: MouseEvent) {
		if (isOpen && container && !container.contains(event.target as Node)) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div bind:this={container} class={cn('custom-select relative', className)}>
	<button
		type="button"
		{id}
		{name}
		{disabled}
		aria-label={ariaLabel}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		onclick={toggleDropdown}
		class={cn(
			'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-950',
			!value ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900'
		)}
	>
		<span class="truncate">{selectedLabel}</span>
		<svg
			class="h-4 w-4 text-slate-500 transition-transform dark:text-slate-400 {isOpen
				? 'rotate-180'
				: ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			role="listbox"
			class="custom-scrollbar absolute top-full left-0 z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
		>
			{#if searchable}
				<div
					class="sticky top-0 z-10 border-b border-slate-100 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
				>
					<input
						type="text"
						bind:this={searchInput}
						bind:value={searchQuery}
						placeholder="Search..."
						class="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => {
							if (e.key === 'Space') e.stopPropagation();
						}}
					/>
				</div>
			{/if}

			{#if filteredOptions.length === 0}
				<div class="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No results found</div>
			{:else}
				{#each filteredOptions as opt}
					<button
						type="button"
						role="option"
						aria-selected={value === opt.value}
						onclick={() => selectOption(opt)}
						class={cn(
							'w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700',
							value === opt.value
								? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-700 dark:text-slate-100'
								: 'text-slate-700 dark:text-slate-300'
						)}
					>
						{opt.label}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
