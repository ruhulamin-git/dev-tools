<script lang="ts">
	import { cn } from '$lib/shared/utils';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	interface DropdownItem {
		id?: string;
		label: string;
		href?: string;
		action?: () => void;
		description?: string;
		active?: boolean;
		[key: string]: any;
	}

	interface Props {
		trigger: {
			label: string | Snippet;
			icon?: any;
			ariaLabel?: string;
			class?: string;
		};
		items: DropdownItem[];
		position?: 'left' | 'right';
		width?: string;
		itemClass?: string;
		class?: string;
		renderTriggerIcon?: Snippet;
		renderItem?: Snippet<[DropdownItem]>;
	}

	let {
		trigger,
		items,
		position = 'left',
		width = 'w-64',
		itemClass,
		class: className,
		renderTriggerIcon,
		renderItem
	}: Props = $props();

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement | null = $state(null);
	let buttonRef: HTMLButtonElement | null = $state(null);
	let menuRef: HTMLDivElement | null = $state(null);
	let dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen && menuRef) {
			const firstItem = menuRef.querySelector(
				'a[role="menuitem"], button[role="menuitem"]'
			) as HTMLElement;
			if (firstItem) {
				setTimeout(() => firstItem.focus(), 10);
			}
		}
	}

	function closeDropdown() {
		isOpen = false;
		buttonRef?.focus();
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeDropdown();
		} else if (event.key === 'Enter' || event.key === ' ') {
			if (event.target === buttonRef) {
				event.preventDefault();
				toggleDropdown();
			}
		} else if (isOpen && menuRef) {
			const menuItems = Array.from(
				menuRef.querySelectorAll('a[role="menuitem"], button[role="menuitem"]')
			) as HTMLElement[];
			const currentIndex = menuItems.findIndex((item) => item === document.activeElement);

			if (event.key === 'ArrowDown') {
				event.preventDefault();
				const nextIndex = (currentIndex + 1) % menuItems.length;
				menuItems[nextIndex]?.focus();
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				const prevIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
				menuItems[prevIndex]?.focus();
			} else if (event.key === 'Home') {
				event.preventDefault();
				menuItems[0]?.focus();
			} else if (event.key === 'End') {
				event.preventDefault();
				menuItems[menuItems.length - 1]?.focus();
			}
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div class={cn('relative', className)} bind:this={dropdownRef}>
	<button
		type="button"
		bind:this={buttonRef}
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		class={cn(
			'flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:text-slate-300 dark:hover:text-slate-100',
			trigger.class
		)}
		aria-expanded={isOpen}
		aria-haspopup="true"
		aria-controls={dropdownId}
		aria-label={trigger.ariaLabel || (typeof trigger.label === 'string' ? trigger.label : 'Menu')}
	>
		{#if renderTriggerIcon}
			{@render renderTriggerIcon()}
		{:else if trigger.icon}
			{@const IconComponent = trigger.icon}
			{#if IconComponent}
				<IconComponent class="h-4 w-4" aria-hidden="true" />
			{/if}
		{/if}
		{#if typeof trigger.label === 'string'}
			<span>{trigger.label}</span>
		{:else}
			{@render trigger.label()}
		{/if}
		<svg
			class="h-4 w-4 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			bind:this={menuRef}
			id={dropdownId}
			class={cn(
				'absolute top-full mt-2 z-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800',
				width,
				position === 'right' ? 'right-0' : 'left-0'
			)}
			role="menu"
			aria-orientation="vertical"
			tabindex="-1"
		>
			<div class="p-2">
				{#each items as item (item.id || item.label)}
					{#if renderItem}
						{@render renderItem(item)}
					{:else if item.href}
						<!-- Link item -->
						<a
							href={item.href}
							class={cn(
								'block rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset dark:text-slate-300 dark:hover:bg-slate-700',
								itemClass
							)}
							role="menuitem"
							tabindex="0"
						>
							<div class="font-medium">{item.label}</div>
							{#if item.description}
								<div class="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
							{/if}
						</a>
					{:else if item.action}
						<!-- Button item -->
						<button
							type="button"
							onclick={() => {
								item.action?.();
								closeDropdown();
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									item.action?.();
									closeDropdown();
								}
							}}
							class={cn(
								'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset',
								item.active
									? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
									: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700',
								itemClass
							)}
							role="menuitem"
							tabindex="0"
						>
							{#if item.icon}
								{@const IconComponent = item.icon}
								{#if IconComponent}
									<IconComponent class="h-4 w-4" aria-hidden="true" />
								{/if}
							{/if}
							<span class="flex-1">{item.label}</span>
							{#if item.active}
								<svg
									class="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
