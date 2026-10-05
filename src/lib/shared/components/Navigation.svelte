<script lang="ts">
	import { base } from '$app/paths';
	import { getLiveTools, getToolUrl } from '$lib/shared/config/tools';
	import { cn } from '$lib/shared/utils';
	import { onMount } from 'svelte';

	interface Props {
		mainWebsiteUrl?: string;
		class?: string;
	}

	let { mainWebsiteUrl = 'https://www.devxhub.com', class: className }: Props = $props();

	let desktopDropdownOpen = $state(false);
	let desktopDropdownButtonRef: HTMLButtonElement | null = $state(null);
	let desktopDropdownMenuRef: HTMLElement | null = $state(null);
	let desktopDropdownId = `dropdown-${Math.random().toString(36).slice(2, 11)}`;

	const liveTools = getLiveTools();
	const allTools = getLiveTools().sort((a, b) => a.priority - b.priority);

	function handleClickOutside(event: MouseEvent) {
		if (
			desktopDropdownMenuRef &&
			desktopDropdownButtonRef &&
			!desktopDropdownMenuRef.contains(event.target as Node) &&
			!desktopDropdownButtonRef.contains(event.target as Node)
		) {
			desktopDropdownOpen = false;
		}
	}

	function toggleDesktopDropdown() {
		desktopDropdownOpen = !desktopDropdownOpen;
		if (desktopDropdownOpen && desktopDropdownMenuRef) {
			const firstLink = desktopDropdownMenuRef.querySelector(
				'a[role="menuitem"]'
			) as HTMLAnchorElement;
			if (firstLink) {
				setTimeout(() => firstLink.focus(), 10);
			}
		}
	}

	function handleDesktopDropdownKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			desktopDropdownOpen = false;
			desktopDropdownButtonRef?.focus();
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleDesktopDropdown();
		} else if (desktopDropdownOpen && desktopDropdownMenuRef) {
			const menuItems = Array.from(
				desktopDropdownMenuRef.querySelectorAll('a[role="menuitem"]')
			) as HTMLAnchorElement[];
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

<nav class={cn('relative hidden md:block', className)}>
	<!-- Desktop Navigation -->
	<div class="flex items-center gap-6">
		<!-- Main Website Link -->
		<a
			href={mainWebsiteUrl}
			target="_blank"
			rel="external noopener noreferrer"
			class="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
		>
			Devxhub
		</a>

		<!-- Tools Dropdown -->
		{#if allTools.length > 0}
			<div class="relative" role="group" aria-label="Tools navigation">
				<button
					type="button"
					bind:this={desktopDropdownButtonRef}
					onclick={toggleDesktopDropdown}
					onkeydown={handleDesktopDropdownKeydown}
					class="flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:text-slate-300 dark:hover:text-slate-100"
					aria-expanded={desktopDropdownOpen}
					aria-haspopup="true"
					aria-controls={desktopDropdownId}
					aria-label="Tools menu"
				>
					Tools
					<svg
						class="h-4 w-4 transition-transform {desktopDropdownOpen ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				<!-- Dropdown Menu -->
				{#if desktopDropdownOpen}
					<div
						bind:this={desktopDropdownMenuRef}
						id={desktopDropdownId}
						class="absolute top-full right-0 z-60 mt-2 max-h-[70vh] w-[560px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
						role="menu"
						tabindex="-1"
					>
						<div class="grid grid-cols-2 gap-1 p-2">
							{#each allTools as tool (tool.slug)}
								{#if tool.status === 'live'}
									<a
										href={getToolUrl(tool, base)}
										onclick={() => (desktopDropdownOpen = false)}
										class="block rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset dark:text-slate-300 dark:hover:bg-slate-700"
										role="menuitem"
										tabindex="0"
									>
										<div class="font-medium">{tool.name}</div>
										<div class="text-xs text-slate-500 dark:text-slate-400">{tool.shortDescription}</div>
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</nav>
