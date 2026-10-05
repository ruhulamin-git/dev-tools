<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		open?: boolean;
		onClose?: () => void;
		title?: string;
		size?: 'sm' | 'md' | 'lg';
		children?: import('svelte').Snippet;
	};

	let { open = $bindable(false), onClose, title, size = 'md', children }: Props = $props();

	const sizeClasses = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl'
	};

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			close();
		}
	}

	function close() {
		open = false;
		onClose?.();
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	// Prevent body scroll when modal is open
	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
			onclick={handleBackdropClick}
			aria-hidden="true"
		></div>

		<!-- Modal Content -->
		<div
			class="relative w-full {sizeClasses[size]} rounded-lg bg-white shadow-xl dark:bg-gray-800"
			class:animate-modal-in={open}
		>
			<!-- Header -->
			{#if title}
				<div class="flex items-center justify-between border-b p-6 dark:border-gray-700">
					<h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-white">
						{title}
					</h2>
					<button
						onclick={close}
						class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
						aria-label="Close modal"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<!-- Body -->
			<div class="p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes modal-in {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.animate-modal-in {
		animation: modal-in 0.2s ease-out;
	}
</style>
