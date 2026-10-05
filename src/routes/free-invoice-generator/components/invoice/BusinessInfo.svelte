<script lang="ts">
	import { Input, Select, Button } from '$lib/shared/components/ui';
	import { COUNTRIES } from '$lib/shared/utils/countries';
	import { getTaxIdLabel } from '$lib/shared/invoice/tax-id-labels';
	import type { CustomField } from '$lib/shared/invoice/types';

	interface Props {
		businessName: string;
		businessAddress: string;
		taxId: string;
		issuerCountry: string;
		clientName: string;
		clientAddress: string;
		clientTaxId: string;
		clientCountry: string;
		businessCustomFields: CustomField[];
		clientCustomFields: CustomField[];
		taxIdHintDismissed: boolean;
	}

	let {
		businessName = $bindable(),
		businessAddress = $bindable(),
		taxId = $bindable(),
		issuerCountry,
		clientName = $bindable(),
		clientAddress = $bindable(),
		clientTaxId = $bindable(),
		clientCountry = $bindable(),
		businessCustomFields = $bindable(),
		clientCustomFields = $bindable(),
		taxIdHintDismissed = $bindable(false)
	}: Props = $props();

	const issuerTaxLabel = $derived(getTaxIdLabel(issuerCountry));
	const clientTaxLabel = $derived(getTaxIdLabel(clientCountry));

	const showCrossBorderTaxHint = $derived(
		!taxIdHintDismissed &&
			!!issuerCountry &&
			!!clientCountry &&
			issuerCountry !== clientCountry &&
			!taxId.trim()
	);

	function addBusinessField() {
		businessCustomFields.push({ id: crypto.randomUUID(), name: '', value: '' });
	}

	function removeBusinessField(id: string) {
		businessCustomFields = businessCustomFields.filter((f) => f.id !== id);
	}

	function addClientField() {
		clientCustomFields.push({ id: crypto.randomUUID(), name: '', value: '' });
	}

	function removeClientField(id: string) {
		clientCustomFields = clientCustomFields.filter((f) => f.id !== id);
	}
</script>

<div class="space-y-6">
	<!-- Business Info -->
	<div>
		<Input
			bind:value={businessName}
			placeholder="Business name"
			class="mb-2 border-slate-300 bg-white font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
		/>
		<Input
			bind:value={businessAddress}
			placeholder="Business address and contacts"
			class="mb-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
		/>
		<div class="mb-2">
			<label for="issuer-tax-id" class="mb-1 block text-xs font-medium text-slate-600"
				>{issuerTaxLabel}</label
			>
			<Input
				id="issuer-tax-id"
				bind:value={taxId}
				placeholder={issuerTaxLabel}
				class="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
			{#if showCrossBorderTaxHint}
				<div
					class="mt-2 flex items-start justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
					role="status"
				>
					<p>
						Issuer and client countries differ. Adding your {issuerTaxLabel} helps with cross-border
						B2B compliance.
					</p>
					<button
						type="button"
						class="shrink-0 text-amber-700 underline hover:no-underline dark:text-amber-300"
						onclick={() => (taxIdHintDismissed = true)}
					>
						Dismiss
					</button>
				</div>
			{/if}
		</div>
		{#each businessCustomFields as field (field.id)}
			<div class="mb-2 flex items-center gap-2">
				<Input
					bind:value={field.name}
					placeholder="Field name (e.g., Email)"
					class="w-1/3 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
				<Input
					bind:value={field.value}
					placeholder="Value"
					class="flex-1 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
				<button
					type="button"
					onclick={() => removeBusinessField(field.id)}
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
			onclick={addBusinessField}
			class="mt-1 flex items-center gap-1 border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add New Field
		</Button>
	</div>

	<!-- Bill To Section -->
	<div>
		<h2 class="mb-2 text-sm font-semibold text-slate-700">Bill To</h2>
		<Input
			bind:value={clientName}
			placeholder="Client's name"
			class="mb-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
		/>
		<Input
			bind:value={clientAddress}
			placeholder="Client's address and contacts"
			class="mb-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
		/>
		<div class="mb-2">
			<label for="client-country" class="mb-1 block text-xs font-medium text-slate-600"
				>Country</label
			>
			<Select
				id="client-country"
				bind:value={clientCountry}
				searchable={true}
				class="w-full border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				options={[
					{ value: '', label: 'Select country' },
					...COUNTRIES.map((c) => ({ value: c, label: c }))
				]}
			/>
		</div>
		<div class="mb-2">
			<label for="client-tax-id" class="mb-1 block text-xs font-medium text-slate-600"
				>{clientTaxLabel}</label
			>
			<Input
				id="client-tax-id"
				bind:value={clientTaxId}
				placeholder={clientTaxLabel}
				class="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>
		{#each clientCustomFields as field (field.id)}
			<div class="mb-2 flex items-center gap-2">
				<Input
					bind:value={field.name}
					placeholder="Field name (e.g., Phone)"
					class="w-1/3 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
				<Input
					bind:value={field.value}
					placeholder="Value"
					class="flex-1 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
				<button
					type="button"
					onclick={() => removeClientField(field.id)}
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
			onclick={addClientField}
			class="mt-1 flex items-center gap-1 border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
		>
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add New Field
		</Button>
	</div>
</div>
