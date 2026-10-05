<script lang="ts">
	import { Textarea } from '$lib/shared/components/ui';

	interface Props {
		notes: string;
		showPaymentConflictWarning?: boolean;
		paymentConflictDismissed?: boolean;
	}

	let {
		notes = $bindable(),
		showPaymentConflictWarning = false,
		paymentConflictDismissed = $bindable(false)
	}: Props = $props();
</script>

<div class="flex-1">
	<h2 class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Notes</h2>
	<Textarea
		bind:value={notes}
		placeholder="Additional notes..."
		rows={4}
		class="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
	/>
	{#if showPaymentConflictWarning && !paymentConflictDismissed}
		<div
			class="mt-2 flex items-start justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
			role="status"
		>
			<p>
				Notes mention a URL or payment service while Payment Details also lists bank/wire
				instructions. The client may not know which method to use — consider keeping one payment
				path.
			</p>
			<button
				type="button"
				class="shrink-0 underline hover:no-underline"
				onclick={() => (paymentConflictDismissed = true)}
			>
				Dismiss
			</button>
		</div>
	{/if}
</div>
