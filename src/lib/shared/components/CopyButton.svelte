<script lang="ts">
	import { Button } from '$lib/shared/components/ui';
	import { copyToClipboard } from '$lib/shared/utils/clipboard';
	import { toast } from '$lib/shared/stores/toastStore';
	import { cn } from '$lib/shared/utils';
	import { Copy, Check } from '@lucide/svelte';

	interface Props {
		text: string;
		label?: string;
		variant?: 'default' | 'secondary' | 'outline' | 'ghost';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
		successMessage?: string;
		errorMessage?: string;
		showIcon?: boolean;
	}

	let {
		text,
		label = 'Copy',
		variant = 'outline',
		size = 'default',
		class: className,
		successMessage = 'Copied to clipboard!',
		errorMessage = 'Failed to copy',
		showIcon = true
	}: Props = $props();

	let copied = $state(false);
	let isCopying = $state(false);

	async function handleCopy() {
		if (!text || isCopying) return;

		isCopying = true;
		const success = await copyToClipboard(text);

		if (success) {
			copied = true;
			toast.success(successMessage);
			setTimeout(() => {
				copied = false;
			}, 2000);
		} else {
			toast.error(errorMessage);
		}

		isCopying = false;
	}
</script>

<Button
	{variant}
	{size}
	class={cn('gap-2', className)}
	onclick={handleCopy}
	disabled={!text || isCopying}
	aria-label={copied ? 'Copied!' : `Copy ${label}`}
>
	{#if showIcon}
		{#if copied}
			<Check class="h-4 w-4" aria-hidden="true" />
		{:else}
			<Copy class="h-4 w-4" aria-hidden="true" />
		{/if}
	{/if}
	<span>{copied ? 'Copied!' : label}</span>
</Button>

