<script lang="ts">
	import Button from '$lib/shared/components/ui/button.svelte';
	import Input from '$lib/shared/components/ui/input.svelte';
	import {
		LogoUpload,
		InvoiceHeader,
		BusinessInfo,
		LineItemsTable,
		InvoiceNotes,
		InvoiceTotals,
		InvoiceSidebar,
		PaymentDetails,
		SignatoryBlock
	} from './invoice';
	import { pushInvoiceEventOnce } from '../analytics';
	import { Datepicker } from '$lib/shared/components/ui';
	import type {
		ChargeBearer,
		CustomField,
		DiscountType,
		LineItem,
		PaymentTermsPreset,
		TaxTreatment
	} from '$lib/shared/invoice/types';
	import {
		allocateNextInvoiceNumber,
		peekNextInvoiceNumber
	} from '$lib/shared/invoice/invoice-numbering';
	import { dueDateFromTerms } from '$lib/shared/invoice/payment-terms';

	import { PDF_CONFIG } from '$lib/shared/invoice/pdf-config';
	import { notesConflictWithPaymentDetails } from '$lib/shared/invoice/payment-conflict';

	const colors = [
		PDF_CONFIG.defaultAccent, // brand purple (primary)
		'#1e293b',
		'#3b82f6',
		'#1d4ed8',
		'#0ea5e9',
		'#0d9488',
		'#10b981',
		'#84cc16',
		'#f43f5e',
		'#7c3aed',
		'#a855f7',
		PDF_CONFIG.brandYellow // decorative only — PDF coerces text accents to purple
	];

	const currencies = [
		{ code: 'USD', symbol: '$', name: 'US Dollar' },
		{ code: 'EUR', symbol: '€', name: 'Euro' },
		{ code: 'GBP', symbol: '£', name: 'British Pound' },
		{ code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
		{ code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
		{ code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
		{ code: 'INR', symbol: '₹', name: 'Indian Rupee' },
		{ code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' }
	];

	let logo: string | null = $state(null);
	let logoKey = $state(0);
	let businessName = $state('');
	let businessAddress = $state('');
	let taxId = $state('');
	let taxIdHintDismissed = $state(false);
	let invoiceNumber = $state('001');
	let numberingMode = $state<'manual' | 'sequential'>('manual');
	let numberPrefix = $state('INV');
	let paymentTermsPreset = $state<PaymentTermsPreset>('Net 7');
	const getNextWeekDate = () => {
		const d = new Date();
		d.setDate(d.getDate() + 7);
		return d.toISOString().split('T')[0];
	};

	let issuedDate = $state(new Date().toISOString().split('T')[0]);
	let dueDate = $state(getNextWeekDate());
	let servicePeriodStart = $state('');
	let servicePeriodEnd = $state('');
	let showAmountInWords = $state(false);
	let signatoryName = $state('');
	let signatoryTitle = $state('');
	let signatureImage: string | null = $state(null);
	let clientName = $state('');
	let clientAddress = $state('');
	let clientTaxId = $state('');
	let clientCountry = $state('');

	let businessCustomFields: CustomField[] = $state([]);
	let clientCustomFields: CustomField[] = $state([]);
	let projectCustomFields: CustomField[] = $state([]);

	let projectName = $state('');
	let notes = $state('');
	let paymentConflictDismissed = $state(false);
	let discountType = $state<DiscountType>('fixed');
	let discount = $state(0);
	let taxPercent = $state(0);
	let taxTreatment = $state<TaxTreatment>('standard');
	let taxTreatmentHintDismissed = $state(false);
	let shipping = $state(0);
	let amountPaid = $state(0);
	let selectedColor = $state(PDF_CONFIG.defaultAccent);
	let selectedCurrency = $state('USD');
	let selectedCountry = $state('United States');

	let accountType = $state('Business');
	let transactionType = $state('International');
	let paymentMethod = $state('Bank Account');
	let bankName = $state('');
	let accountName = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let accountNumber = $state('');
	let routingNumber = $state('');
	let swiftBicCode = $state('');
	let branchName = $state('');
	let branchAddress = $state('');
	let intermediaryBankName = $state('');
	let intermediarySwiftBic = $state('');
	let chargeBearer = $state<ChargeBearer>('SHA');
	let paymentReference = $state('001');
	let paypalEmail = $state('');
	let mobileNumber = $state('');
	let qrCode: string | null = $state(null);

	let lineItems: LineItem[] = $state([{ id: 1, description: '', qty: 1, price: 0, unit: '' }]);

	let currencySymbol = $derived(currencies.find((c) => c.code === selectedCurrency)?.symbol || '$');
	let currencyCode = $derived(selectedCurrency);

	let subtotal = $derived(lineItems.reduce((sum, item) => sum + item.qty * item.price, 0));

	let calculatedDiscount = $derived(
		discountType === 'percentage' ? (subtotal * discount) / 100 : discount
	);

	let effectiveTaxPercent = $derived(taxTreatment === 'standard' ? taxPercent : 0);

	let taxAmount = $derived(
		Math.max(0, subtotal - calculatedDiscount) * (effectiveTaxPercent / 100)
	);

	let total = $derived(subtotal - calculatedDiscount + taxAmount + shipping);

	let balanceDue = $derived(total - amountPaid);

	const isCrossBorder = $derived(
		!!selectedCountry && !!clientCountry && selectedCountry !== clientCountry
	);

	const showCrossBorderTaxTreatmentHint = $derived(
		isCrossBorder && taxTreatment === 'zero_rated_export'
	);

	const hasPaymentDetails = $derived(
		!!(
			bankName ||
			accountName ||
			firstName ||
			lastName ||
			accountNumber ||
			routingNumber ||
			swiftBicCode ||
			branchName ||
			branchAddress ||
			paypalEmail ||
			mobileNumber ||
			intermediaryBankName ||
			intermediarySwiftBic ||
			paymentReference
		)
	);

	const showPaymentConflictWarning = $derived(
		notesConflictWithPaymentDetails(notes, hasPaymentDetails)
	);

	// Keep payment reference aligned with invoice # until the user edits it.
	let paymentRefManual = $state(false);
	$effect(() => {
		const num = invoiceNumber;
		if (!paymentRefManual) {
			paymentReference = num;
		}
	});

	function onPaymentReferenceInput() {
		paymentRefManual = true;
		if (paymentReference === '') {
			paymentRefManual = false;
		}
	}

	// Cross-border default: zero-rated export; domestic default: standard.
	let prevCrossBorder = $state<boolean | null>(null);
	$effect(() => {
		const cross = isCrossBorder;
		if (prevCrossBorder === null) {
			if (cross) taxTreatment = 'zero_rated_export';
			prevCrossBorder = cross;
			return;
		}
		if (cross !== prevCrossBorder) {
			taxTreatment = cross ? 'zero_rated_export' : 'standard';
			taxTreatmentHintDismissed = false;
			prevCrossBorder = cross;
		}
	});

	$effect(() => {
		if (taxTreatment !== 'standard' && taxPercent !== 0) {
			taxPercent = 0;
		}
	});

	function buildPdfPayload(preview = false) {
		return {
			logo,
			businessName,
			businessAddress,
			taxId,
			clientName,
			clientAddress,
			clientTaxId,
			clientCountry,
			businessCustomFields,
			clientCustomFields,
			projectCustomFields,
			invoiceNumber,
			issuedDate,
			dueDate,
			paymentTermsPreset,
			servicePeriodStart,
			servicePeriodEnd,
			lineItems,
			notes,
			subtotal,
			discountType,
			discount,
			calculatedDiscount,
			taxPercent: effectiveTaxPercent,
			taxAmount,
			taxTreatment,
			shipping,
			total,
			amountPaid,
			balanceDue,
			currencySymbol,
			currencyCode,
			accentColor: selectedColor,
			projectName,
			showAmountInWords,
			signatoryName,
			signatoryTitle,
			signatureImage,
			bankName,
			accountName,
			firstName,
			lastName,
			accountNumber,
			routingNumber,
			branchName,
			branchAddress,
			accountType,
			transactionType,
			paymentMethod,
			swiftBicCode,
			intermediaryBankName,
			intermediarySwiftBic,
			chargeBearer,
			paymentReference,
			paypalEmail,
			mobileNumber,
			qrCode,
			selectedCountry,
			preview
		};
	}

	function clearAll() {
		logo = null;
		logoKey++;
		businessName = '';
		businessAddress = '';
		taxId = '';
		taxIdHintDismissed = false;
		invoiceNumber = '001';
		numberingMode = 'manual';
		numberPrefix = 'INV';
		paymentTermsPreset = 'Net 7';
		issuedDate = new Date().toISOString().split('T')[0];
		dueDate = dueDateFromTerms(issuedDate, 'Net 7') || getNextWeekDate();
		servicePeriodStart = '';
		servicePeriodEnd = '';
		showAmountInWords = false;
		signatoryName = '';
		signatoryTitle = '';
		signatureImage = null;
		clientName = '';
		clientAddress = '';
		clientTaxId = '';
		clientCountry = '';
		businessCustomFields = [];
		clientCustomFields = [];
		projectCustomFields = [];
		projectName = '';
		notes = '';
		paymentConflictDismissed = false;
		discountType = 'fixed';
		discount = 0;
		taxPercent = 0;
		taxTreatment = 'standard';
		taxTreatmentHintDismissed = false;
		shipping = 0;
		amountPaid = 0;
		bankName = '';
		accountName = '';
		firstName = '';
		lastName = '';
		accountNumber = '';
		routingNumber = '';
		swiftBicCode = '';
		branchName = '';
		branchAddress = '';
		intermediaryBankName = '';
		intermediarySwiftBic = '';
		chargeBearer = 'SHA';
		paymentReference = '001';
		paymentRefManual = false;
		paypalEmail = '';
		mobileNumber = '';
		qrCode = null;
		lineItems = [{ id: 1, description: '', qty: 1, price: 0, unit: '' }];
		prevCrossBorder = null;
	}

	function ensureSequentialAllocated() {
		if (numberingMode !== 'sequential') return;
		const peeked = peekNextInvoiceNumber(numberPrefix);
		if (invoiceNumber === peeked) {
			invoiceNumber = allocateNextInvoiceNumber(numberPrefix);
		}
	}

	// jsPDF (and the dompurify/fflate it pulls in) is a large dependency this page only needs
	// once the visitor actually asks for a PDF — loading it eagerly with the rest of the page
	// made this route's own chunk by far the heaviest in the app. Deferred to the moment it's
	// actually used, on either button click, rather than paid for on every page load.
	async function downloadInvoice() {
		ensureSequentialAllocated();
		const { generateInvoicePDF } = await import('$lib/shared/utils/pdfGenerator');
		generateInvoicePDF(buildPdfPayload(false));
		pushInvoiceEventOnce('invoice_download');
	}

	async function previewDesign() {
		const { generateInvoicePDF } = await import('$lib/shared/utils/pdfGenerator');
		generateInvoicePDF(buildPdfPayload(true));
		pushInvoiceEventOnce('invoice_preview');
	}

	function onBuilderInteraction() {
		pushInvoiceEventOnce('invoice_tool_start');
	}

	function addProjectField() {
		projectCustomFields.push({ id: crypto.randomUUID(), name: '', value: '' });
	}

	function removeProjectField(id: string) {
		projectCustomFields = projectCustomFields.filter((f) => f.id !== id);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]"
	onfocusin={onBuilderInteraction}
	oninput={onBuilderInteraction}
>
	<div class="space-y-4">
		<div
			class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="mb-6 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row">
				{#key logoKey}
					<LogoUpload bind:logo accentColor={selectedColor} />
				{/key}
				<InvoiceHeader
					bind:invoiceNumber
					bind:issuedDate
					bind:dueDate
					bind:paymentTermsPreset
					bind:numberingMode
					bind:numberPrefix
					accentColor={selectedColor}
				/>
			</div>

			<div class="mb-6">
				<BusinessInfo
					bind:businessName
					bind:businessAddress
					bind:taxId
					issuerCountry={selectedCountry}
					bind:clientName
					bind:clientAddress
					bind:clientTaxId
					bind:clientCountry
					bind:businessCustomFields
					bind:clientCustomFields
					bind:taxIdHintDismissed
				/>
			</div>

			<div class="mb-6">
				<label
					for="project-name"
					class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
					>Project Name</label
				>
				<Input
					id="project-name"
					bind:value={projectName}
					placeholder="e.g., E-commerce Platform Development"
					class="mb-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
				<div class="mb-3 space-y-2 rounded border border-slate-200 p-3 dark:border-slate-600">
					<p class="text-xs font-medium text-slate-600 dark:text-slate-400">
						Service Period / Delivery Date (optional)
					</p>
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<label for="service-start" class="mb-1 block text-xs text-slate-500"
								>Start / delivery</label
							>
							<Datepicker
								id="service-start"
								bind:value={servicePeriodStart}
								class="h-8 border-slate-300 bg-white text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
							/>
						</div>
						<div>
							<label for="service-end" class="mb-1 block text-xs text-slate-500"
								>End (leave empty for single date)</label
							>
							<Datepicker
								id="service-end"
								bind:value={servicePeriodEnd}
								class="h-8 border-slate-300 bg-white text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
							/>
						</div>
					</div>
				</div>
				{#each projectCustomFields as field (field.id)}
					<div class="mb-2 flex items-center gap-2">
						<Input
							bind:value={field.name}
							placeholder="Field name"
							class="w-1/3 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
						<Input
							bind:value={field.value}
							placeholder="Value"
							class="flex-1 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
						/>
						<button
							type="button"
							onclick={() => removeProjectField(field.id)}
							class="text-slate-400 hover:text-red-500"
							aria-label="Remove field"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				{/each}
				<Button
					variant="outline"
					size="sm"
					onclick={addProjectField}
					class="mt-1 flex items-center gap-1 border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
				>
					<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add New Field
				</Button>
			</div>

			<LineItemsTable bind:items={lineItems} {currencySymbol} />

			<div class="flex flex-col gap-4 sm:gap-6 md:flex-row">
				<div class="flex-1 space-y-4">
					<InvoiceNotes
						bind:notes
						{showPaymentConflictWarning}
						bind:paymentConflictDismissed
					/>
					<label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
						<input
							type="checkbox"
							bind:checked={showAmountInWords}
							class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
						/>
						Show amount in words on invoice
					</label>
				</div>
				<InvoiceTotals
					{subtotal}
					bind:discountType
					bind:discount
					bind:taxPercent
					bind:taxTreatment
					bind:shipping
					taxAmount={taxAmount}
					{calculatedDiscount}
					{total}
					bind:amountPaid
					{balanceDue}
					{currencySymbol}
					{currencyCode}
					bind:taxTreatmentHintDismissed
					{showCrossBorderTaxTreatmentHint}
				/>
			</div>

			<div class="mt-6 border-t border-slate-200 pt-6">
				<PaymentDetails
					{selectedCountry}
					bind:accountType
					bind:transactionType
					bind:paymentMethod
					bind:bankName
					bind:accountName
					bind:firstName
					bind:lastName
					bind:accountNumber
					bind:routingNumber
					bind:swiftBicCode
					bind:branchName
					bind:branchAddress
					bind:intermediaryBankName
					bind:intermediarySwiftBic
					bind:chargeBearer
					bind:paymentReference
					onPaymentReferenceInput={onPaymentReferenceInput}
					bind:paypalEmail
					bind:mobileNumber
					bind:qrCode
				/>
			</div>

			<div class="mt-6 border-t border-slate-200 pt-6">
				<SignatoryBlock
					bind:signatoryName
					bind:signatoryTitle
					bind:signatureImage
				/>
			</div>
		</div>
	</div>

	<InvoiceSidebar
		{colors}
		bind:selectedColor
		{currencies}
		bind:selectedCurrency
		bind:selectedCountry
		onPreview={previewDesign}
		onDownload={downloadInvoice}
		onClear={clearAll}
	/>
</div>
