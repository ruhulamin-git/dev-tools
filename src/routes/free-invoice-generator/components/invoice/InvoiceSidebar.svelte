<script lang="ts">
	import { Button, Select } from '$lib/shared/components/ui';
	import ColorPicker from './ColorPicker.svelte';
	import { COUNTRIES } from '$lib/shared/utils/countries';

	interface Currency {
		code: string;
		symbol: string;
		name: string;
	}

	interface Props {
		colors: string[];
		selectedColor: string;
		currencies: Currency[];
		selectedCurrency: string;
		selectedCountry: string;
		onPreview?: () => void;
		onDownload?: () => void;
		onClear?: () => void;
	}

	let {
		colors,
		selectedColor = $bindable(),
		currencies,
		selectedCurrency = $bindable(),
		selectedCountry = $bindable(),
		onPreview,
		onDownload,
		onClear
	}: Props = $props();
</script>

<div class="sticky top-[10vh] space-y-4 self-start xl:top-[25vh]">
	<div
		class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
	>
		<h2 id="invoice-heading" class="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
			Make an invoice. Simple and fast.
		</h2>

		<!-- Preview Button -->
		<Button
			variant="outline"
			onclick={onPreview}
			class="mb-3 w-full justify-center border-slate-300 text-slate-700 hover:bg-slate-50"
		>
			<span class="mr-2">👁</span> Preview Your Design
		</Button>

		<!-- Download Button -->
		<Button
			onclick={onDownload}
			class="mb-3 w-full justify-center text-white transition-opacity hover:opacity-90"
			style="background-color: {selectedColor};"
		>
			Download Your Free Invoice
		</Button>
		<p class="mb-3 text-center text-xs text-slate-500 dark:text-slate-400">
			Nothing you type leaves your browser.
		</p>

		<!-- Country and Currency -->
		<div class="mb-4 grid grid-cols-2 items-end gap-3">
			<!-- Country Selector -->
			<div>
				<label for="country-select" class="mb-2 block text-sm font-medium text-slate-700"
					>Country</label
				>
				<Select
					id="country-select"
					bind:value={selectedCountry}
					searchable={true}
					class="w-full border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
					options={COUNTRIES.map((c) => ({ value: c, label: c }))}
				/>
			</div>

			<!-- Currency Selector -->
			<div>
				<label for="currency-select" class="mb-2 block text-sm font-medium text-slate-700"
					>Currency</label
				>
				<Select
					id="currency-select"
					bind:value={selectedCurrency}
					class="w-full border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
					options={currencies.map((c) => ({ value: c.code, label: `${c.code} (${c.symbol})` }))}
				/>
			</div>
		</div>

		<!-- Clear All Button -->
		<Button
			variant="outline"
			onclick={onClear}
			class="group flex w-full items-center justify-center gap-2 border-slate-300 bg-white text-sm font-medium text-slate-700 transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
		>
			<svg
				class="h-4 w-4 transition-transform group-hover:rotate-180"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
			Clear All
		</Button>

		<!-- Color Picker -->
		<div class="mb-2">
			<span class="mb-2 block text-sm font-medium text-slate-700">Color</span>
			<ColorPicker {colors} bind:selectedColor />
		</div>
	</div>
</div>
