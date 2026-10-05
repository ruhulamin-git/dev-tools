<script lang="ts">
	import { Input, Select } from '$lib/shared/components/ui';
	import type { DiscountType, TaxTreatment } from '$lib/shared/invoice/types';

	interface Props {
		subtotal: number;
		discountType?: DiscountType;
		discount: number;
		calculatedDiscount?: number;
		taxPercent: number;
		taxAmount?: number;
		taxTreatment: TaxTreatment;
		shipping: number;
		total: number;
		amountPaid: number;
		balanceDue: number;
		currencySymbol?: string;
		currencyCode?: string;
		taxTreatmentHintDismissed: boolean;
		showCrossBorderTaxTreatmentHint: boolean;
	}

	let {
		subtotal,
		discountType = $bindable('fixed'),
		discount = $bindable(),
		calculatedDiscount = 0,
		taxPercent = $bindable(),
		taxAmount = 0,
		taxTreatment = $bindable('standard'),
		shipping = $bindable(),
		total,
		amountPaid = $bindable(),
		balanceDue,
		currencySymbol = '$',
		currencyCode = 'USD',
		taxTreatmentHintDismissed = $bindable(false),
		showCrossBorderTaxTreatmentHint = false
	}: Props = $props();

	const taxInputDisabled = $derived(taxTreatment !== 'standard');

	function formatCurrency(amount: number): string {
		return `${currencySymbol} ${amount.toFixed(2)}`;
	}

	const treatmentOptions = [
		{ value: 'standard', label: 'Standard' },
		{ value: 'zero_rated_export', label: 'Zero-rated export' },
		{ value: 'reverse_charge', label: 'Reverse charge' },
		{ value: 'exempt', label: 'Exempt' },
		{ value: 'none', label: 'None' }
	];
</script>

<div class="w-full space-y-2 md:w-72">
	<div class="flex items-center justify-between">
		<span class="text-sm text-slate-600 dark:text-slate-300">Subtotal</span>
		<span class="text-sm font-medium text-slate-900 dark:text-white"
			>{formatCurrency(subtotal)}</span
		>
	</div>
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<label for="discount-input" class="text-sm text-slate-600 dark:text-slate-300">Discount</label
			>
			<select
				bind:value={discountType}
				class="h-7 cursor-pointer rounded border border-slate-200 bg-slate-50 py-0 pr-7 pl-1 text-xs text-slate-700 outline-none focus:ring-0 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-slate-600"
			>
				<option value="fixed">Fixed</option>
				<option value="percentage">%</option>
			</select>
		</div>
		<Input
			id="discount-input"
			type="number"
			bind:value={discount}
			min="0"
			step="0.01"
			class="h-8 w-24 border-slate-300 text-right text-sm text-slate-900 dark:border-slate-500 dark:bg-slate-700 dark:text-white"
		/>
	</div>
	{#if discountType === 'percentage' && discount > 0}
		<div class="flex items-center justify-end pr-1 text-xs text-slate-500">
			Amount: - {formatCurrency(calculatedDiscount)}
		</div>
	{/if}

	<div class="space-y-1">
		<label for="tax-treatment" class="text-sm text-slate-600 dark:text-slate-300"
			>Tax treatment</label
		>
		<Select
			id="tax-treatment"
			bind:value={taxTreatment}
			options={treatmentOptions}
			class="w-full border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
		/>
		{#if showCrossBorderTaxTreatmentHint && !taxTreatmentHintDismissed}
			<div
				class="flex items-start justify-between gap-2 rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
				role="status"
			>
				<p>
					Issuer and client countries differ — defaulted to zero-rated export. Change if that does
					not apply.
				</p>
				<button
					type="button"
					class="shrink-0 underline hover:no-underline"
					onclick={() => (taxTreatmentHintDismissed = true)}
				>
					Dismiss
				</button>
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-between gap-2">
		<label for="tax-input" class="text-sm text-slate-600 dark:text-slate-300">Tax (%)</label>
		<Input
			id="tax-input"
			type="number"
			bind:value={taxPercent}
			min="0"
			max="100"
			step="0.01"
			disabled={taxInputDisabled}
			class="h-8 w-24 border-slate-300 text-right text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:bg-slate-700 dark:text-white"
		/>
	</div>
	{#if taxInputDisabled}
		<div class="text-right text-xs text-slate-500">
			Tax amount: {formatCurrency(taxAmount)}
		</div>
	{/if}

	<div class="flex items-center justify-between gap-2">
		<label for="shipping-input" class="text-sm text-slate-600 dark:text-slate-300">Shipping</label>
		<Input
			id="shipping-input"
			type="number"
			bind:value={shipping}
			min="0"
			step="0.01"
			class="h-8 w-24 border-slate-300 text-right text-sm text-slate-900 dark:border-slate-500 dark:bg-slate-700 dark:text-white"
		/>
	</div>
	<div
		class="flex items-center justify-between border-t border-slate-300 pt-2 dark:border-slate-600"
	>
		<span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Total</span>
		<span class="text-sm font-bold text-slate-900 dark:text-white"
			>{currencyCode} {total.toFixed(2)}</span
		>
	</div>
	<div class="flex items-center justify-between gap-2">
		<label for="amount-paid-input" class="text-sm text-slate-600 dark:text-slate-300"
			>Amount Paid</label
		>
		<Input
			id="amount-paid-input"
			type="number"
			bind:value={amountPaid}
			min="0"
			step="0.01"
			class="h-8 w-24 border-slate-300 text-right text-sm text-slate-900 dark:border-slate-500 dark:bg-slate-700 dark:text-white"
		/>
	</div>
	<div
		class="flex items-center justify-between border-t border-slate-300 pt-2 dark:border-slate-600"
	>
		<span class="text-sm font-bold text-blue-600 dark:text-blue-400">Balance Due</span>
		<span class="text-base font-bold text-blue-600 dark:text-blue-400"
			>{currencyCode} {balanceDue.toFixed(2)}</span
		>
	</div>
</div>
