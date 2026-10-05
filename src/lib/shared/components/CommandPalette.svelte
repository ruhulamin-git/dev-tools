<script lang="ts">
	/**
	 * A ⌘K / Ctrl+K command palette: search every tool from anywhere in the app, not just the
	 * home page's own inline search. This is the Hick's-law argument taken further — a visitor
	 * partway through one tool who realizes they want a different one doesn't have to navigate
	 * home first, and a keyboard-first visitor never has to reach for the mouse at all.
	 *
	 * Mounted once, at the root layout, so it's available on every page.
	 */
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getLiveTools, getToolUrl, type Tool } from '$lib/shared/config/tools';
	import { track } from '$lib/shared/analytics/track';

	let open = $state(false);
	let query = $state('');
	let activeIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();
	let triggerToRestore: HTMLElement | null = null;

	const allTools = getLiveTools().sort((a, b) => a.priority - b.priority);

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return allTools.slice(0, 8);
		return allTools
			.filter(
				(tool) =>
					tool.name.toLowerCase().includes(q) ||
					tool.shortDescription.toLowerCase().includes(q) ||
					tool.keywords?.some((k) => k.toLowerCase().includes(q))
			)
			.slice(0, 8);
	});

	function openPalette() {
		triggerToRestore = document.activeElement as HTMLElement | null;
		open = true;
		query = '';
		activeIndex = 0;
		track('palette_open');
		// The input isn't in the DOM until `open` flips; focus it once it is.
		queueMicrotask(() => inputEl?.focus());
	}

	function closePalette() {
		open = false;
		triggerToRestore?.focus();
	}

	function selectTool(tool: Tool) {
		if (query.trim()) track('search', { label: query.trim() });
		closePalette();
		goto(getToolUrl(tool, base));
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		const isMod = e.metaKey || e.ctrlKey;
		if (isMod && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			if (open) {
				closePalette();
			} else {
				openPalette();
			}
			return;
		}
		if (e.key === '/' && !open) {
			const target = e.target as HTMLElement | null;
			const isTyping =
				target &&
				(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
			if (!isTyping) {
				e.preventDefault();
				openPalette();
			}
		}
	}

	function handlePaletteKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			closePalette();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const tool = results[activeIndex];
			if (tool) selectTool(tool);
		}
	}

	// Query changes reset the selection, so an old highlighted index from a longer result list
	// never points past the end of a shorter, newly-filtered one.
	$effect(() => {
		void query;
		activeIndex = 0;
	});
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<!--
	The visible trigger — a small "search / ⌘K" affordance any page can show. Kept minimal here;
	individual pages (the home page hero) render their own inline search input and don't need
	this button too.
-->
{#if open}
	<div
		class="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
		role="dialog"
		aria-modal="true"
		aria-label="Search tools"
	>
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={closePalette}
			aria-hidden="true"
		></div>

		<div
			class="relative w-full max-w-xl overflow-hidden rounded-devx-card border border-white/10 bg-devx-header shadow-2xl"
		>
			<div class="flex items-center gap-3 border-b border-white/10 px-4 py-3">
				<svg
					class="h-5 w-5 shrink-0 text-devx-text-muted"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
					/>
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					onkeydown={handlePaletteKeydown}
					type="text"
					placeholder="Search tools… (JSON, password, QR, invoice)"
					class="w-full bg-transparent text-devx-text placeholder-devx-text-muted outline-none"
					aria-label="Search tools"
					aria-controls="command-palette-results"
					aria-activedescendant={results[activeIndex]
						? `command-palette-option-${results[activeIndex].slug}`
						: undefined}
					role="combobox"
					aria-expanded="true"
				/>
				<kbd
					class="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-xs text-devx-text-muted sm:inline"
					>Esc</kbd
				>
			</div>

			<ul id="command-palette-results" role="listbox" class="max-h-80 overflow-y-auto py-2">
				{#each results as tool, i (tool.slug)}
					<li role="presentation">
						<button
							id={`command-palette-option-${tool.slug}`}
							role="option"
							aria-selected={i === activeIndex}
							type="button"
							class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors {i ===
							activeIndex
								? 'bg-devx-yellow/10 text-devx-yellow'
								: 'text-devx-text hover:bg-white/5'}"
							onmouseenter={() => (activeIndex = i)}
							onclick={() => selectTool(tool)}
						>
							<span class="min-w-0 flex-1">
								<span class="block truncate text-sm font-medium">{tool.name}</span>
								<span class="block truncate text-xs text-devx-text-muted"
									>{tool.shortDescription}</span
								>
							</span>
						</button>
					</li>
				{:else}
					<li class="px-4 py-6 text-center text-sm text-devx-text-muted">
						No tools match "{query}".
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
