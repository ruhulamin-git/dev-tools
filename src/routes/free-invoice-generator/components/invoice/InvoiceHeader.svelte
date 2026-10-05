<script lang="ts">
	import { Input, Datepicker, Select, Button } from '$lib/shared/components/ui';
	import type { PaymentTermsPreset } from '$lib/shared/invoice/types';
	import { PAYMENT_TERMS_PRESETS, dueDateFromTerms } from '$lib/shared/invoice/payment-terms';
	import {
		allocateNextInvoiceNumber,
		invoiceNumberDateMismatchWarning,
		peekNextInvoiceNumber
	} from '$lib/shared/invoice/invoice-numbering';

	interface Props {
		invoiceNumber: string;
		issuedDate: string;
		dueDate: string;
		paymentTermsPreset: PaymentTermsPreset;
		numberingMode: 'manual' | 'sequential';
		numberPrefix: string;
		accentColor?: string;
	}

	let {
		invoiceNumber = $bindable(),
		issuedDate = $bindable(),
		dueDate = $bindable(),
		paymentTermsPreset = $bindable('Net 7' as PaymentTermsPreset),
		numberingMode = $bindable('manual' as 'manual' | 'sequential'),
		numberPrefix = $bindable('INV'),
		accentColor = '#3b82f6'
	}: Props = $props();

	let suppressingDueSync = $state(false);

	const dateMismatchWarning = $derived(
		numberingMode === 'manual'
			? invoiceNumberDateMismatchWarning(invoiceNumber, issuedDate)
			: null
	);

	const nextPreview = $derived(
		numberingMode === 'sequential' ? peekNextInvoiceNumber(numberPrefix) : ''
	);

	function getAccentColorClass(baseColor: string): string {
		const darkColors = ['#1e293b'];
		if (darkColors.includes(baseColor)) {
			return 'text-slate-800 dark:text-blue-400';
		}
		return '';
	}

	function applyTermsDueDate() {
		const next = dueDateFromTerms(issuedDate, paymentTermsPreset);
		if (next) {
			suppressingDueSync = true;
			dueDate = next;
			queueMicrotask(() => {
				suppressingDueSync = false;
			});
		}
	}

	function onTermsChange(value: string | number) {
		paymentTermsPreset = value as PaymentTermsPreset;
		applyTermsDueDate();
	}

	function onIssuedChange() {
		if (paymentTermsPreset !== 'Custom') {
			applyTermsDueDate();
		}
	}

	function onDueChange() {
		if (suppressingDueSync) return;
		const expected = dueDateFromTerms(issuedDate, paymentTermsPreset);
		if (expected !== null && dueDate !== expected) {
			paymentTermsPreset = 'Custom';
		}
	}

	function useNextSequential() {
		invoiceNumber = allocateNextInvoiceNumber(numberPrefix);
	}

	function refreshSequentialPreview() {
		invoiceNumber = peekNextInvoiceNumber(numberPrefix);
	}

	let prevNumberingMode = $state(numberingMode);
	$effect(() => {
		if (numberingMode === 'sequential' && prevNumberingMode !== 'sequential') {
			invoiceNumber = peekNextInvoiceNumber(numberPrefix);
		}
		prevNumberingMode = numberingMode;
	});
</script>

<div class="flex-1 text-right">
	<h1
		class="mb-4 text-2xl font-bold sm:text-3xl {getAccentColorClass(accentColor)}"
		style="color: {accentColor};"
	>
		INVOICE
	</h1>
	<div class="space-y-2">
		<div class="flex flex-col items-end gap-1">
			<div class="flex flex-wrap items-center justify-end gap-2">
				<label class="flex items-center gap-1.5 text-xs text-slate-600">
					<input
						type="radio"
						value="manual"
						bind:group={numberingMode}
						class="text-blue-600 focus:ring-blue-500"
					/>
					Manual
				</label>
				<label class="flex items-center gap-1.5 text-xs text-slate-600">
					<input
						type="radio"
						value="sequential"
						bind:group={numberingMode}
						class="text-blue-600 focus:ring-blue-500"
					/>
					Auto (PREFIX-YYYY-NNNN)
				</label>
			</div>
			{#if numberingMode === 'sequential'}
				<div class="flex flex-wrap items-center justify-end gap-2">
					<label for="number-prefix" class="text-xs font-medium text-slate-600">Prefix</label>
					<Input
						id="number-prefix"
						bind:value={numberPrefix}
						class="h-8 w-16 border-slate-300 bg-white text-right text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						placeholder="INV"
						oninput={refreshSequentialPreview}
					/>
					<span class="font-mono text-sm text-slate-800 dark:text-slate-100">{nextPreview}</span>
					<Button
						variant="outline"
						size="sm"
						onclick={useNextSequential}
						class="h-8 border-slate-300 text-xs"
					>
						Use next
					</Button>
				</div>
				<p class="max-w-xs text-right text-[11px] text-slate-500">
					Counter is stored in this browser. Project codes stay in the Project field, not the
					invoice number.
				</p>
			{:else}
				<div class="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
					<label for="invoice-number" class="text-xs font-medium text-slate-600 sm:text-sm"
						>Invoice #</label
					>
					<Input
						id="invoice-number"
						bind:value={invoiceNumber}
						class="h-8 w-28 border-slate-300 bg-white text-right text-sm text-slate-900 sm:w-36 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						placeholder="001"
					/>
				</div>
				{#if dateMismatchWarning}
					<p class="max-w-xs text-right text-[11px] text-amber-700 dark:text-amber-300" role="status">
						{dateMismatchWarning}
					</p>
				{/if}
			{/if}
		</div>

		<div class="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
			<label for="payment-terms" class="text-xs font-medium text-slate-600 sm:text-sm">Terms</label>
			<div class="w-40">
				<Select
					id="payment-terms"
					value={paymentTermsPreset}
					onchange={onTermsChange}
					options={PAYMENT_TERMS_PRESETS.map((t) => ({ value: t, label: t }))}
					class="w-full border-slate-300 bg-white text-left text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
			</div>
		</div>

		<div class="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
			<label for="issued-date" class="text-xs font-medium text-slate-600 sm:text-sm">Issued</label>
			<Datepicker
				id="issued-date"
				bind:value={issuedDate}
				onchange={onIssuedChange}
				class="h-8 w-32 border-slate-300 bg-white text-sm text-slate-900 sm:w-36 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>
		<div class="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
			<label for="due-date" class="text-xs font-medium text-slate-600 sm:text-sm">Due</label>
			<Datepicker
				id="due-date"
				bind:value={dueDate}
				onchange={onDueChange}
				class="h-8 w-32 border-slate-300 bg-white text-sm text-slate-900 sm:w-36 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>
	</div>
</div>
