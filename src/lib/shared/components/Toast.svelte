<script lang="ts">
	import { toast, type Toast as ToastType } from '$lib/shared/stores/toastStore';
	import { cn } from '$lib/shared/utils';
	import { onMount } from 'svelte';

	interface Props {
		toast: ToastType;
	}

	let { toast: toastData }: Props = $props();
	let isVisible = $state(false);
	let isRemoving = $state(false);

	onMount(() => {
		// Animate in
		setTimeout(() => {
			isVisible = true;
		}, 10);
	});

	function handleRemove() {
		isRemoving = true;
		setTimeout(() => {
			toast.remove(toastData.id);
		}, 300); // Wait for animation
	}

	const typeStyles = {
		success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
		error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
		info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
	};

	const iconPaths = {
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
		warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};
</script>

<div
	class={cn(
		'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
		typeStyles[toastData.type],
		isVisible && !isRemoving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
	)}
	role="alert"
	aria-live="polite"
>
	<!-- Icon -->
	<div class="flex-shrink-0">
		<svg
			class="h-5 w-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d={iconPaths[toastData.type]}
			/>
		</svg>
	</div>

	<!-- Message -->
	<p class="flex-1 text-sm font-medium">{toastData.message}</p>

	<!-- Close Button -->
	<button
		type="button"
		onclick={handleRemove}
		class="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
		aria-label="Close notification"
	>
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
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</button>
</div>

