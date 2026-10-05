<script lang="ts">
	import { toast } from '$lib/shared/stores/toastStore';
	import Toast from './Toast.svelte';
</script>

<!-- Toast Container -->
<div
	class="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 sm:bottom-4 sm:right-4 sm:p-0"
	role="region"
	aria-label="Notifications"
	aria-live="polite"
>
	{#each $toast as toastItem (toastItem.id)}
		<Toast toast={toastItem} />
	{/each}
</div>

