<script lang="ts">
	interface Props {
		show: boolean;
		message: string;
		type?: 'success' | 'error' | 'info';
	}

	let { show, message, type = 'success' }: Props = $props();
</script>

{#if show}
	<div
		class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform"
		role="status"
		aria-live="polite"
		style="animation: toastSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
	>
		<div
			class="flex items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-sm"
		>
			{#if type === 'success'}
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
					<svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
			{:else if type === 'error'}
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
					<svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
			{:else}
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
					<svg class="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			{/if}
			<span class="text-sm font-medium">{message}</span>
		</div>
	</div>
{/if}

<style>
	@keyframes toastSlideUp {
		from {
			opacity: 0;
			transform: translate(-50%, 16px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>
