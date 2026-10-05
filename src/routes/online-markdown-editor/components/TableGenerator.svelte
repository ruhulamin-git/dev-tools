<script lang="ts">
	import { X } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { isOpen = $bindable(), onInsert }: { isOpen: boolean; onInsert: (val: string) => void } =
		$props();

	let rows = $state(3);
	let cols = $state(3);
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
		modalContainer.id = 'table-generator-modal';
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

	function insert() {
		let md = '\n';
		md += '| ' + Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(' | ') + ' |\n';
		md += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
		for (let i = 0; i < rows; i++) {
			md += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
		}
		onInsert(md);
		isOpen = false;
	}
</script>

{#if isOpen && modalContainer}
	{#key isOpen}
		<div use:portal={modalContainer}>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					class="light-scrollbar relative m-4 max-h-[90vh] w-80 max-w-[90vw] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					role="document"
				>
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-xl text-slate-900 font-bold">Insert Table</h3>
						<button
							onclick={() => (isOpen = false)}
							class="text-slate-600 transition-colors hover:text-slate-900"
							aria-label="Close modal"
						>
							<X size={20} />
						</button>
					</div>

					<div class="space-y-5">
						<div class="grid grid-cols-2 gap-5">
							<div>
								<label class="mb-2 block text-sm font-medium text-slate-900">
									Rows
									<input
										type="number"
										bind:value={rows}
										min="1"
										max="50"
										class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none focus:ring-offset-0"
										style="box-shadow: none !important;"
									/>
								</label>
							</div>
							<div>
								<label class="mb-2 block text-sm font-medium text-slate-900">
									Columns
									<input
										type="number"
										bind:value={cols}
										min="1"
										max="20"
										class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none focus:ring-offset-0"
										style="box-shadow: none !important;"
									/>
								</label>
							</div>
						</div>

						<div>
							<span class="mb-2 block text-sm font-medium text-slate-900">Preview</span>
							<pre
								class="h-32 w-full overflow-auto rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs whitespace-pre text-slate-900">{(() => {
									let md = '';
									md +=
										'| ' +
										Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(' | ') +
										' |\n';
									md += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
									for (let i = 0; i < rows; i++) {
										md += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
									}
									return md;
								})()}</pre>
						</div>

						<div class="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onclick={() => (isOpen = false)}
								class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
								>Cancel</button
							>
							<button
								onclick={insert}
								disabled={rows < 1 || cols < 1 || rows > 50 || cols > 20}
								class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Insert Table
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/key}
{/if}
