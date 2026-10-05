<script lang="ts">
	import { Input, Button } from '$lib/shared/components/ui';
	import type { LineItem } from '$lib/shared/invoice/types';
	import { UNIT_PRESETS } from '$lib/shared/invoice/units';

	interface Props {
		items: LineItem[];
		currencySymbol?: string;
		onItemsChange?: (items: LineItem[]) => void;
	}

	let {
		items = $bindable(),
		currencySymbol = '$',
		onItemsChange
	}: Props = $props();

	let nextItemId = $state(items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1);

	let descriptionErrors = $derived(
		items.map((item) => (item.description.trim() === '' ? 'Description required.' : ''))
	);

	function formatCurrency(amount: number): string {
		return `${currencySymbol} ${amount.toFixed(2)}`;
	}

	function addItem() {
		items = [...items, { id: nextItemId, description: '', qty: 1, price: 0, unit: '' }];
		nextItemId++;
		onItemsChange?.(items);
	}

	function removeItem(id: number) {
		if (items.length > 1) {
			items = items.filter((item) => item.id !== id);
			onItemsChange?.(items);
		}
	}
</script>

<div class="mb-6">
	<div
		class="hidden grid-cols-[1fr_80px_100px_110px_110px_40px] gap-4 border-b border-slate-300 pb-2 sm:grid"
	>
		<div class="text-left text-sm font-semibold text-slate-700">Description</div>
		<div class="text-left text-sm font-semibold text-slate-700">QTY</div>
		<div class="text-left text-sm font-semibold text-slate-700">Unit</div>
		<div class="text-left text-sm font-semibold text-slate-700">Price</div>
		<div class="text-right text-sm font-semibold text-slate-700">Amount</div>
		<div></div>
	</div>

	{#each items as item, index (item.id)}
		<!-- Mobile -->
		<div class="space-y-3 border-b border-slate-200 py-4 sm:hidden">
			<div>
				<label for="desc-{item.id}" class="mb-1 block text-xs font-medium text-slate-600"
					>Description</label
				>
				<Input
					id="desc-{item.id}"
					bind:value={item.description}
					placeholder="Description here..."
					class="h-9 w-full border-slate-300 bg-white text-sm text-slate-900 {descriptionErrors[
						index
					]
						? 'border-red-500'
						: ''}"
				/>
				{#if descriptionErrors[index]}
					<p class="mt-1 h-4 text-xs text-red-600 dark:text-red-400">
						{descriptionErrors[index]}
					</p>
				{/if}
			</div>
			<div class="grid grid-cols-3 gap-3">
				<div>
					<label for="qty-{item.id}" class="mb-1 block text-xs font-medium text-slate-600"
						>QTY</label
					>
					<Input
						id="qty-{item.id}"
						type="number"
						bind:value={item.qty}
						min="1"
						class="h-9 w-full border-slate-300 bg-white text-left text-sm text-slate-900"
					/>
				</div>
				<div>
					<label for="unit-{item.id}" class="mb-1 block text-xs font-medium text-slate-600"
						>Unit</label
					>
					<input
						id="unit-{item.id}"
						list="unit-presets"
						bind:value={item.unit}
						placeholder="e.g. hour"
						class="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
					/>
				</div>
				<div>
					<label for="price-{item.id}" class="mb-1 block text-xs font-medium text-slate-600"
						>Price</label
					>
					<Input
						id="price-{item.id}"
						type="number"
						bind:value={item.price}
						min="0"
						step="0.01"
						class="h-9 w-full border-slate-300 bg-white text-left text-sm text-slate-900"
					/>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="text-sm font-medium text-slate-700">
					Amount: {formatCurrency(item.qty * item.price)}
				</div>
				{#if items.length > 1}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => removeItem(item.id)}
						class="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
						aria-label="Remove item"
					>
						×
					</Button>
				{/if}
			</div>
		</div>

		<!-- Desktop -->
		<div
			class="hidden grid-cols-[1fr_80px_100px_110px_110px_40px] gap-4 border-b border-slate-200 py-2 sm:grid"
		>
			<div>
				<Input
					bind:value={item.description}
					placeholder="Description here..."
					ariaLabel="Item {index + 1} description"
					class="h-9 border-slate-300 bg-white text-sm text-slate-900 {descriptionErrors[index]
						? 'border-red-500'
						: ''}"
				/>
				{#if descriptionErrors[index]}
					<p class="mt-1 h-4 text-xs text-red-600 dark:text-red-400">
						{descriptionErrors[index]}
					</p>
				{/if}
			</div>
			<div>
				<Input
					type="number"
					bind:value={item.qty}
					min="1"
					ariaLabel="Item {index + 1} quantity"
					class="h-9 w-full border-slate-300 bg-white text-left text-sm text-slate-900"
				/>
			</div>
			<div>
				<input
					list="unit-presets"
					bind:value={item.unit}
					placeholder="Unit"
					aria-label="Item {index + 1} unit"
					class="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
			</div>
			<div>
				<Input
					type="number"
					bind:value={item.price}
					min="0"
					step="0.01"
					ariaLabel="Item {index + 1} price"
					class="h-9 w-full border-slate-300 bg-white text-left text-sm text-slate-900"
				/>
			</div>
			<div class="flex h-9 items-center justify-end text-sm font-medium text-slate-700">
				{formatCurrency(item.qty * item.price)}
			</div>
			<div class="flex h-9 items-center justify-center">
				{#if items.length > 1}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => removeItem(item.id)}
						class="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
						aria-label="Remove item {index + 1}"
					>
						×
					</Button>
				{/if}
			</div>
		</div>
	{/each}

	<datalist id="unit-presets">
		{#each UNIT_PRESETS as preset}
			<option value={preset}></option>
		{/each}
	</datalist>

	<Button
		variant="outline"
		size="sm"
		onclick={addItem}
		class="mt-3 flex items-center gap-1 border-dashed border-slate-300 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
	>
		<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		Add New Item
	</Button>
</div>
