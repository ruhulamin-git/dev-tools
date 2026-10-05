<script lang="ts">
	import { X } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		isOpen = $bindable(false),
		onInsert,
		initialText = ''
	}: {
		isOpen: boolean;
		onInsert: (text: string, url: string) => void;
		initialText?: string;
	} = $props();

	let text = $state(initialText);
	let url = $state('https://');
	let modalContainer = $state<HTMLElement | null>(null);

	function portal(node: HTMLElement, target: HTMLElement) {
		target.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}

	function getPortalTarget() {
		return document.fullscreenElement || document.body;
	}

	onMount(() => {
		modalContainer = document.createElement('div');
		modalContainer.id = 'link-modal';
		getPortalTarget().appendChild(modalContainer);

		const handleFullscreenChange = () => {
			if (modalContainer) {
				const target = getPortalTarget();
				if (modalContainer.parentNode !== target) target.appendChild(modalContainer);
			}
		};
		document.addEventListener('fullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			if (modalContainer && modalContainer.parentNode)
				modalContainer.parentNode.removeChild(modalContainer);
		};
	});

	function handleSubmit() {
		if (text.trim() && url.trim()) {
			onInsert(text.trim(), url.trim());
			isOpen = false;
			text = initialText;
			url = 'https://';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			handleSubmit();
		}
	}

	$effect(() => {
		text = initialText;
	});
</script>

{#if isOpen && modalContainer}
	{#key isOpen}
		<div use:portal={modalContainer}>
			<div
				class="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				onclick={(e) => {
					if (e.target === e.currentTarget) isOpen = false;
				}}
				onkeydown={(e) => {
					if (e.key === 'Escape') isOpen = false;
				}}
			>
				<div
					class="light-scrollbar relative m-4 max-h-[90vh] w-80 max-w-[90vw] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					role="document"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-xl text-slate-900 font-bold">Insert Link</h3>
						<button
							onclick={() => (isOpen = false)}
							class="text-slate-600 transition-colors hover:text-slate-900"
							aria-label="Close modal"
						>
							<X size={20} />
						</button>
					</div>

					<form
						onsubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
						class="space-y-5"
					>
						<div>
							<label class="mb-2 block text-sm font-medium text-slate-900">
								Link Text
								<input
									type="text"
									bind:value={text}
									placeholder="Enter link text"
									class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none focus:ring-offset-0"
									style="box-shadow: none !important;"
									onkeydown={handleKeydown}
								/>
							</label>
						</div>
						<div>
							<label class="mb-2 block text-sm font-medium text-slate-900">
								URL
								<input
									type="url"
									bind:value={url}
									placeholder="https://example.com"
									class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none focus:ring-offset-0"
									style="box-shadow: none !important;"
									onkeydown={handleKeydown}
								/>
							</label>
						</div>
						<div class="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onclick={() => (isOpen = false)}
								class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
								>Cancel</button
							>
							<button
								type="submit"
								disabled={!text.trim() || !url.trim()}
								class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
								>Insert Link</button
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/key}
{/if}
