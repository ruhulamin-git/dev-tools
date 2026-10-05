<script lang="ts">
	import { Input, Select } from '$lib/shared/components/ui';
	import { browser } from '$app/environment';
	import type { ChargeBearer } from '$lib/shared/invoice/types';

	interface Props {
		selectedCountry: string;
		accountType: string;
		transactionType: string;
		paymentMethod: string;
		bankName?: string;
		accountName?: string;
		firstName?: string;
		lastName?: string;
		accountNumber?: string;
		routingNumber?: string;
		swiftBicCode?: string;
		branchName?: string;
		branchAddress?: string;
		intermediaryBankName?: string;
		intermediarySwiftBic?: string;
		chargeBearer?: ChargeBearer;
		paymentReference?: string;
		paypalEmail?: string;
		mobileNumber?: string;
		qrCode?: string | null;
		onPaymentReferenceInput?: () => void;
	}

	let {
		selectedCountry,
		accountType = $bindable('Business'),
		transactionType = $bindable('International'),
		paymentMethod = $bindable('Bank Account'),
		bankName = $bindable(''),
		accountName = $bindable(''),
		firstName = $bindable(''),
		lastName = $bindable(''),
		accountNumber = $bindable(''),
		routingNumber = $bindable(''),
		swiftBicCode = $bindable(''),
		branchName = $bindable(''),
		branchAddress = $bindable(''),
		intermediaryBankName = $bindable(''),
		intermediarySwiftBic = $bindable(''),
		chargeBearer = $bindable('SHA' as ChargeBearer),
		paymentReference = $bindable(''),
		paypalEmail = $bindable(''),
		mobileNumber = $bindable(''),
		qrCode = $bindable(null),
		onPaymentReferenceInput
	}: Props = $props();

	const showIntlWireExtras = $derived(
		transactionType === 'International' && paymentMethod === 'Bank Account'
	);

	const isBD = $derived(selectedCountry === 'Bangladesh');

	const bdBanks = [
		{ value: 'Sonali Bank PLC', label: 'Sonali Bank PLC' },
		{ value: 'Janata Bank PLC', label: 'Janata Bank PLC' },
		{ value: 'Agrani Bank PLC', label: 'Agrani Bank PLC' },
		{ value: 'Rupali Bank PLC', label: 'Rupali Bank PLC' },
		{ value: 'BASIC Bank PLC', label: 'BASIC Bank PLC' },
		{ value: 'Bangladesh Development Bank PLC', label: 'Bangladesh Development Bank PLC' },
		{ value: 'Bangladesh Commerce Bank Limited', label: 'Bangladesh Commerce Bank Limited' },
		{ value: 'Bangladesh Krishi Bank', label: 'Bangladesh Krishi Bank' },
		{ value: 'Rajshahi Krishi Unnayan Bank', label: 'Rajshahi Krishi Unnayan Bank' },
		{ value: 'Ansar VDP Unnayan Bank', label: 'Ansar VDP Unnayan Bank' },
		{ value: 'Karmasangthan Bank', label: 'Karmasangthan Bank' },
		{ value: 'AB Bank PLC', label: 'AB Bank PLC' },
		{ value: 'Al-Arafah Islami Bank PLC', label: 'Al-Arafah Islami Bank PLC' },
		{ value: 'Bank Asia PLC', label: 'Bank Asia PLC' },
		{ value: 'Bengal Commercial Bank PLC', label: 'Bengal Commercial Bank PLC' },
		{ value: 'BRAC Bank PLC', label: 'BRAC Bank PLC' },
		{ value: 'Citizens Bank PLC', label: 'Citizens Bank PLC' },
		{ value: 'City Bank PLC', label: 'City Bank PLC' },
		{ value: 'Community Bank Bangladesh PLC', label: 'Community Bank Bangladesh PLC' },
		{ value: 'Dhaka Bank PLC', label: 'Dhaka Bank PLC' },
		{ value: 'Dutch-Bangla Bank PLC', label: 'Dutch-Bangla Bank PLC' },
		{ value: 'Eastern Bank PLC', label: 'Eastern Bank PLC' },
		{
			value: 'Export Import Bank of Bangladesh PLC (EXIM Bank)',
			label: 'Export Import Bank of Bangladesh PLC (EXIM Bank)'
		},
		{ value: 'First Security Islami Bank PLC', label: 'First Security Islami Bank PLC' },
		{ value: 'Global Islami Bank PLC', label: 'Global Islami Bank PLC' },
		{ value: 'IFIC Bank PLC', label: 'IFIC Bank PLC' },
		{ value: 'Islami Bank Bangladesh PLC', label: 'Islami Bank Bangladesh PLC' },
		{ value: 'Jamuna Bank PLC', label: 'Jamuna Bank PLC' },
		{ value: 'Meghna Bank PLC', label: 'Meghna Bank PLC' },
		{ value: 'Mercantile Bank PLC', label: 'Mercantile Bank PLC' },
		{ value: 'Midland Bank PLC', label: 'Midland Bank PLC' },
		{ value: 'Modhumoti Bank PLC', label: 'Modhumoti Bank PLC' },
		{ value: 'Mutual Trust Bank PLC', label: 'Mutual Trust Bank PLC' },
		{ value: 'National Bank Limited', label: 'National Bank Limited' },
		{
			value: 'National Credit and Commerce Bank PLC (NCC Bank)',
			label: 'National Credit and Commerce Bank PLC (NCC Bank)'
		},
		{ value: 'NRB Bank PLC', label: 'NRB Bank PLC' },
		{ value: 'NRBC Bank PLC', label: 'NRBC Bank PLC' },
		{ value: 'Padma Bank PLC', label: 'Padma Bank PLC' },
		{ value: 'Prime Bank PLC', label: 'Prime Bank PLC' },
		{ value: 'Pubali Bank PLC', label: 'Pubali Bank PLC' },
		{ value: 'Shahjalal Islami Bank PLC', label: 'Shahjalal Islami Bank PLC' },
		{ value: 'Shimanto Bank PLC', label: 'Shimanto Bank PLC' },
		{ value: 'Social Islami Bank PLC', label: 'Social Islami Bank PLC' },
		{
			value: 'South Bangla Agriculture and Commerce Bank PLC (SBAC)',
			label: 'South Bangla Agriculture and Commerce Bank PLC (SBAC)'
		},
		{ value: 'Southeast Bank PLC', label: 'Southeast Bank PLC' },
		{ value: 'Standard Bank PLC', label: 'Standard Bank PLC' },
		{ value: 'The Premier Bank PLC', label: 'The Premier Bank PLC' },
		{ value: 'Trust Bank Limited', label: 'Trust Bank Limited' },
		{ value: 'Union Bank PLC', label: 'Union Bank PLC' },
		{ value: 'United Commercial Bank PLC (UCB)', label: 'United Commercial Bank PLC (UCB)' },
		{ value: 'Uttara Bank PLC', label: 'Uttara Bank PLC' },
		{ value: 'Bank Al-Falah Limited', label: 'Bank Al-Falah Limited' },
		{ value: 'Citibank N.A.', label: 'Citibank N.A.' },
		{ value: 'Commercial Bank of Ceylon PLC', label: 'Commercial Bank of Ceylon PLC' },
		{ value: 'Habib Bank Limited', label: 'Habib Bank Limited' },
		{
			value: 'HSBC (The Hongkong and Shanghai Banking Corporation Limited)',
			label: 'HSBC (The Hongkong and Shanghai Banking Corporation Limited)'
		},
		{ value: 'ICICI Bank Limited', label: 'ICICI Bank Limited' },
		{ value: 'National Bank of Pakistan', label: 'National Bank of Pakistan' },
		{ value: 'Standard Chartered Bank', label: 'Standard Chartered Bank' },
		{ value: 'State Bank of India', label: 'State Bank of India' },
		{ value: 'Nagad Digital Bank PLC', label: 'Nagad Digital Bank PLC' }
	];

	// Ensure payment method is valid if country changes
	$effect(() => {
		if (!isBD && (paymentMethod === 'bKash' || paymentMethod === 'Nagad')) {
			paymentMethod = 'Bank Account';
		}
	});

	let debounceTimeout: ReturnType<typeof setTimeout>;

	// Generate QR Code from mobile number
	$effect(() => {
		if (paymentMethod === 'bKash' || paymentMethod === 'Nagad') {
			if (mobileNumber && mobileNumber.length >= 11) {
				clearTimeout(debounceTimeout);
				debounceTimeout = setTimeout(async () => {
					try {
						if (browser) {
							const QRCode = (await import('qrcode')).default;
							qrCode = await QRCode.toDataURL(mobileNumber, { margin: 0, width: 300 });
						}
					} catch (err) {
						console.error('Failed to generate QR code', err);
					}
				}, 500);
			} else if (!mobileNumber) {
				qrCode = null;
			}
		}
	});
</script>

<div class="space-y-6">
	<!-- Payment Details Section -->
	<div>
		<h2 class="mb-3 text-sm font-semibold text-slate-700">Payment Details</h2>
		<div class="space-y-4">
			<!-- Account & Transaction Type -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-2 block text-xs font-medium text-slate-600">Account Type</label>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="Business"
								bind:group={accountType}
								class="text-blue-600 focus:ring-blue-500"
							/>
							Business
						</label>
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="Personal"
								bind:group={accountType}
								class="text-blue-600 focus:ring-blue-500"
							/>
							Personal
						</label>
					</div>
				</div>
				<div>
					<label class="mb-2 block text-xs font-medium text-slate-600">Transaction Type</label>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="International"
								bind:group={transactionType}
								class="text-blue-600 focus:ring-blue-500"
							/>
							International
						</label>
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="Domestic"
								bind:group={transactionType}
								class="text-blue-600 focus:ring-blue-500"
							/>
							Domestic
						</label>
					</div>
				</div>
			</div>

			<!-- Payment Method -->
			<div>
				<label class="mb-2 block text-xs font-medium text-slate-600">Payment Method</label>
				<div class="flex flex-wrap gap-4">
					<label class="flex items-center gap-2 text-sm text-slate-700">
						<input
							type="radio"
							value="Bank Account"
							bind:group={paymentMethod}
							class="text-blue-600 focus:ring-blue-500"
						/>
						Bank Account
					</label>
					{#if isBD}
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="bKash"
								bind:group={paymentMethod}
								class="text-blue-600 focus:ring-blue-500"
							/>
							bKash
						</label>
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="Nagad"
								bind:group={paymentMethod}
								class="text-blue-600 focus:ring-blue-500"
							/>
							Nagad
						</label>
					{:else}
						<label class="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="radio"
								value="PayPal"
								bind:group={paymentMethod}
								class="text-blue-600 focus:ring-blue-500"
							/>
							PayPal
						</label>
					{/if}
				</div>
			</div>

			<div class="space-y-3 border-t border-slate-200 pt-4">
				{#if paymentMethod === 'Bank Account'}
					<div>
						<label for="bank-name" class="mb-1 block text-xs font-medium text-slate-600"
							>Bank Name</label
						>
						{#if isBD}
							<Select
								id="bank-name"
								bind:value={bankName}
								options={bdBanks}
								searchable={true}
								class="w-full border-slate-300 bg-white text-slate-900"
							/>
						{:else}
							<Input
								id="bank-name"
								bind:value={bankName}
								placeholder="Enter bank name"
								class="border-slate-300 bg-white text-slate-900"
							/>
						{/if}
					</div>

					{#if accountType === 'Business'}
						<div>
							<label for="account-name" class="mb-1 block text-xs font-medium text-slate-600"
								>Account Name</label
							>
							<Input
								id="account-name"
								bind:value={accountName}
								placeholder="Business/Account name"
								class="border-slate-300 bg-white text-slate-900"
							/>
						</div>
					{:else}
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label for="first-name" class="mb-1 block text-xs font-medium text-slate-600"
									>First Name</label
								>
								<Input
									id="first-name"
									bind:value={firstName}
									placeholder="First name"
									class="border-slate-300 bg-white text-slate-900"
								/>
							</div>
							<div>
								<label for="last-name" class="mb-1 block text-xs font-medium text-slate-600"
									>Last Name</label
								>
								<Input
									id="last-name"
									bind:value={lastName}
									placeholder="Last name"
									class="border-slate-300 bg-white text-slate-900"
								/>
							</div>
						</div>
					{/if}

					<div>
						<label for="account-number" class="mb-1 block text-xs font-medium text-slate-600"
							>Account Number</label
						>
						<Input
							id="account-number"
							bind:value={accountNumber}
							placeholder="Account number"
							class="border-slate-300 bg-white text-slate-900"
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						{#if transactionType === 'International'}
							<div>
								<label for="swift-code" class="mb-1 block text-xs font-medium text-slate-600"
									>SWIFT/BIC Code</label
								>
								<Input
									id="swift-code"
									bind:value={swiftBicCode}
									placeholder="Enter your bank's 8- to 11-character SWIFT/BIC code"
									class="border-slate-300 bg-white text-slate-900"
								/>
							</div>
						{:else}
							<div>
								<label for="routing-number" class="mb-1 block text-xs font-medium text-slate-600"
									>Routing Number</label
								>
								<Input
									id="routing-number"
									bind:value={routingNumber}
									placeholder="Routing number"
									class="border-slate-300 bg-white text-slate-900"
								/>
							</div>
						{/if}
						<div>
							<label for="branch-name" class="mb-1 block text-xs font-medium text-slate-600"
								>Branch Name</label
							>
							<Input
								id="branch-name"
								bind:value={branchName}
								placeholder="Branch name"
								class="border-slate-300 bg-white text-slate-900"
							/>
						</div>
					</div>

					<div>
						<label for="branch-address" class="mb-1 block text-xs font-medium text-slate-600"
							>Branch Address</label
						>
						<Input
							id="branch-address"
							bind:value={branchAddress}
							placeholder="Branch address"
							class="border-slate-300 bg-white text-slate-900"
						/>
					</div>

					{#if showIntlWireExtras}
						<div class="space-y-3 border-t border-dashed border-slate-200 pt-4">
							<div>
								<label
									for="intermediary-bank"
									class="mb-1 block text-xs font-medium text-slate-600"
									>Intermediary / correspondent bank name</label
								>
								<Input
									id="intermediary-bank"
									bind:value={intermediaryBankName}
									placeholder="Correspondent bank name"
									class="border-slate-300 bg-white text-slate-900"
								/>
								<p class="mt-1 text-xs text-slate-500">
									USD wires to non-US banks usually route through a correspondent. Omitting it often
									causes delays or failed transfers.
								</p>
							</div>
							<div>
								<label
									for="intermediary-swift"
									class="mb-1 block text-xs font-medium text-slate-600"
									>Intermediary SWIFT/BIC</label
								>
								<Input
									id="intermediary-swift"
									bind:value={intermediarySwiftBic}
									placeholder="8- to 11-character SWIFT/BIC"
									class="border-slate-300 bg-white text-slate-900"
								/>
							</div>
							<div>
								<span class="mb-2 block text-xs font-medium text-slate-600">Charge bearer</span>
								<div class="flex flex-wrap gap-4">
									<label class="flex items-center gap-2 text-sm text-slate-700">
										<input
											type="radio"
											value="OUR"
											bind:group={chargeBearer}
											class="text-blue-600 focus:ring-blue-500"
										/>
										OUR
									</label>
									<label class="flex items-center gap-2 text-sm text-slate-700">
										<input
											type="radio"
											value="SHA"
											bind:group={chargeBearer}
											class="text-blue-600 focus:ring-blue-500"
										/>
										SHA
									</label>
									<label class="flex items-center gap-2 text-sm text-slate-700">
										<input
											type="radio"
											value="BEN"
											bind:group={chargeBearer}
											class="text-blue-600 focus:ring-blue-500"
										/>
										BEN
									</label>
								</div>
							</div>
							<div>
								<label
									for="payment-reference"
									class="mb-1 block text-xs font-medium text-slate-600"
									>Payment reference instruction</label
								>
								<Input
									id="payment-reference"
									bind:value={paymentReference}
									placeholder="Invoice number or payment reference"
									class="border-slate-300 bg-white text-slate-900"
									oninput={onPaymentReferenceInput}
								/>
							</div>
						</div>
					{/if}
				{:else if paymentMethod === 'PayPal'}
					<div>
						<label for="paypal-email" class="mb-1 block text-xs font-medium text-slate-600"
							>PayPal Email / ID</label
						>
						<Input
							id="paypal-email"
							bind:value={paypalEmail}
							placeholder="Email address"
							class="border-slate-300 bg-white text-slate-900"
						/>
					</div>
				{:else if paymentMethod === 'bKash' || paymentMethod === 'Nagad'}
					<div>
						<label for="mobile-number" class="mb-1 block text-xs font-medium text-slate-600"
							>{paymentMethod} Wallet Number</label
						>
						<Input
							id="mobile-number"
							bind:value={mobileNumber}
							placeholder="Phone number"
							class="border-slate-300 bg-white text-slate-900"
						/>
					</div>
					{#if qrCode}
						<div class="mt-3">
							<label class="mb-2 block text-xs font-medium text-slate-600">QR Code</label>
							<div class="relative mb-2 inline-block">
								<img
									src={qrCode}
									alt="QR Code"
									class="h-[140px] w-[140px] rounded border border-slate-200 bg-white object-contain p-1"
								/>
							</div>
							<p class="text-xs text-slate-500">Generated automatically from wallet number</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
