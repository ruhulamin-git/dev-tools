<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Button,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Select,
		Input,
		Checkbox,
		Label,
		Slider
	} from '$lib/shared/components/ui';
	import { generators, getSelectedVersionInfo, validateUuid, type GeneratorKey } from '../utils';

	interface Props {
		onBulkGenerate?: (count: number) => void;
	}

	let { onBulkGenerate }: Props = $props();

	let results = $state<Record<GeneratorKey, string>>({
		uuidV1: '',
		uuidV4: '',
		uuidV7: '',
		uuidCompact: '',
		uuidUpper: '',
		guidBraced: '',
		uuidUrn: '',
		nanoid: '',
		ulid: '',
		shortHex: '',
		sortableId: ''
	});

	let selected = $state<GeneratorKey>('uuidV4');
	let copied = $state<GeneratorKey | null>(null);

	const advanced = $state({
		uppercase: false,
		stripHyphens: false,
		braces: false,
		urn: false,
		timestampSuffix: false,
		timestampPrefix: false,
		lowercase: false,
		specialCharacter: false,
		onlyNumber: false,
		onlyCharacter: false
	});

	let bulkCount = $state(1);
	let bulkResults = $state<string[]>([]);
	let uuidInput = $state('');
	let uuidValid = $state<boolean | null>(null);
	let uuidVersionDetected = $state<string | null>(null);

	const generateAll = () => {
		const next = { ...results };
		generators.forEach((g) => {
			next[g.key] = g.run();
		});
		results = next;
		copied = null;
	};

	const copyValue = async (key: GeneratorKey) => {
		const value = results[key];
		if (!value || !navigator?.clipboard) return;
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => {
			if (copied === key) copied = null;
		}, 1200);
	};

	const applyAdvanced = (base: string) => {
		let value = base;
		if (advanced.onlyNumber) value = value.replace(/\D+/g, '') || '0';
		if (advanced.onlyCharacter) value = value.replace(/[^a-zA-Z]+/g, '') || 'A';
		if (advanced.stripHyphens) value = value.replace(/-/g, '');
		if (advanced.uppercase) value = value.toUpperCase();
		if (advanced.lowercase) value = value.toLowerCase();
		if (advanced.braces) value = `{${value}}`;
		if (advanced.urn) value = value.startsWith('urn:uuid:') ? value : `urn:uuid:${value}`;
		if (advanced.timestampPrefix) value = `${Date.now()}-${value}`;
		if (advanced.timestampSuffix) value = `${value}-${Date.now()}`;
		if (advanced.specialCharacter) value = `${value}!`;
		return value;
	};

	const generateSelected = () => {
		const gen = generators.find((g) => g.key === selected);
		if (!gen) return;
		const base = gen.run();
		const nextValue = applyAdvanced(base);
		results = { ...results, [selected]: nextValue };
		copied = null;
	};

	const generateBulkSelected = () => {
		const gen = generators.find((g) => g.key === selected);
		if (!gen) return;
		let count = Number(bulkCount);
		if (!Number.isFinite(count)) count = 1;
		count = Math.min(1000, Math.max(1, Math.floor(count)));
		bulkCount = count;
		const list: string[] = [];
		for (let i = 0; i < count; i += 1) {
			const base = gen.run();
			const value = applyAdvanced(base);
			list.push(value);
		}
		bulkResults = list;
		if (list.length > 0) {
			results = { ...results, [selected]: list[0] };
		}
		copied = null;
		
		// Notify parent component about bulk generation
		if (onBulkGenerate) {
			onBulkGenerate(count);
		}
	};

	const handleSelectChange = () => {
		generateSelected();
		if (bulkResults.length > 0) generateBulkSelected();
	};
	const handleAdvancedChange = () => {
		generateSelected();
		if (bulkResults.length > 0) generateBulkSelected();
	};

	const downloadBulkIds = (type: 'txt' | 'csv') => {
		if (!bulkResults.length) return;
		const content = bulkResults.join('\n');
		const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `bulk-ids.${type}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const handleValidateInput = () => {
		const { valid, version } = validateUuid(uuidInput);
		uuidValid = uuidInput.trim() ? valid : null;
		uuidVersionDetected = version;
	};

	onMount(() => {
		generateAll();
		generateSelected();
	});
</script>

<div class="space-y-6">
	<div class="grid gap-6 lg:grid-cols-2">
		<div class="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Configuration</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label htmlFor="id-selector">ID Type</Label>
						<Select
							id="id-selector"
							bind:value={selected}
							onchange={() => handleSelectChange()}
							ariaLabel="Select ID type"
							options={generators.map((g) => ({ value: g.key, label: g.label }))}
						/>
						<p class="text-muted-foreground text-xs">
							{generators.find((g) => g.key === selected)?.description}
						</p>
					</div>

					<div class="space-y-2">
						<Label>Advanced Options</Label>
						<div class="grid gap-2 sm:grid-cols-2">
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-upper"
									bind:checked={advanced.uppercase}
									onchange={handleAdvancedChange}
									ariaLabel="Uppercase"
								/><Label htmlFor="opt-upper" class="cursor-pointer font-normal">Uppercase</Label>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-hyphens"
									bind:checked={advanced.stripHyphens}
									onchange={handleAdvancedChange}
									ariaLabel="Strip hyphens"
								/><Label htmlFor="opt-hyphens" class="cursor-pointer font-normal"
									>Strip hyphens</Label
								>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-braces"
									bind:checked={advanced.braces}
									onchange={handleAdvancedChange}
									ariaLabel="Add braces"
								/><Label htmlFor="opt-braces" class="cursor-pointer font-normal">Add braces</Label>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-urn"
									bind:checked={advanced.urn}
									onchange={handleAdvancedChange}
									ariaLabel="URN prefix"
								/><Label htmlFor="opt-urn" class="cursor-pointer font-normal">URN prefix</Label>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-ts-suffix"
									bind:checked={advanced.timestampSuffix}
									onchange={handleAdvancedChange}
									ariaLabel="Timestamp suffix"
								/><Label htmlFor="opt-ts-suffix" class="cursor-pointer font-normal"
									>Timestamp suffix</Label
								>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-ts-prefix"
									bind:checked={advanced.timestampPrefix}
									onchange={handleAdvancedChange}
									ariaLabel="Timestamp prefix"
								/><Label htmlFor="opt-ts-prefix" class="cursor-pointer font-normal"
									>Timestamp prefix</Label
								>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-lower"
									bind:checked={advanced.lowercase}
									onchange={handleAdvancedChange}
									ariaLabel="Lowercase"
								/><Label htmlFor="opt-lower" class="cursor-pointer font-normal">Lowercase</Label>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-special"
									bind:checked={advanced.specialCharacter}
									onchange={handleAdvancedChange}
									ariaLabel="Special char"
								/><Label htmlFor="opt-special" class="cursor-pointer font-normal"
									>Special char</Label
								>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-only-num"
									bind:checked={advanced.onlyNumber}
									onchange={handleAdvancedChange}
									ariaLabel="Only numbers"
								/><Label htmlFor="opt-only-num" class="cursor-pointer font-normal"
									>Only numbers</Label
								>
							</div>
							<div class="flex items-center gap-2">
								<Checkbox
									id="opt-only-char"
									bind:checked={advanced.onlyCharacter}
									onchange={handleAdvancedChange}
									ariaLabel="Only characters"
								/><Label htmlFor="opt-only-char" class="cursor-pointer font-normal"
									>Only characters</Label
								>
							</div>
						</div>
					</div>

					<div class="space-y-2">
						<Label htmlFor="bulk-count">Bulk Count: {bulkCount}</Label>
						<div class="flex w-full items-center gap-4">
							<Slider
								id="bulk-count-slider"
								min={1}
								max={1000}
								bind:value={bulkCount}
								class="flex-1"
								ariaLabel="Bulk count slider"
							/>
							<Input
								id="bulk-count"
								type="number"
								min="1"
								max="1000"
								bind:value={bulkCount}
								class="w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								ariaLabel="Bulk count input"
							/>
						</div>
					</div>
					<Button class="w-full" onclick={generateBulkSelected}>Generate {bulkCount} IDs</Button>

					<div class="space-y-2">
						<Label htmlFor="uuid-validator">UUID Validator</Label>
						<Input
							id="uuid-validator"
							placeholder="Paste a UUID to validate"
							bind:value={uuidInput}
							oninput={handleValidateInput}
						/>
						{#if uuidValid === true}<p class="text-xs text-emerald-600 dark:text-emerald-400">
								✓ Valid UUID {uuidVersionDetected ? `(${uuidVersionDetected})` : ''}
							</p>
						{:else if uuidValid === false}<p class="text-xs text-red-600 dark:text-red-400">
								✗ Invalid UUID (must match RFC 4122 format)
							</p>
						{:else}<p class="text-muted-foreground text-xs">
								Supports v1, v4, v7 UUIDs (with or without hyphens)
							</p>{/if}
					</div>
				</CardContent>
			</Card>
		</div>

		<Card class="flex h-full flex-col gap-4">
			<CardHeader>
				<CardTitle>Result</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="space-y-2">
					<Label htmlFor="current-id">Current ID ({generators.find((g) => g.key === selected)?.label})</Label>
					<div class="flex gap-2">
						<Input id="current-id" readonly value={results[selected] || '—'} class="font-mono" />
						<Button
							variant="outline"
							size="icon"
							onclick={() => copyValue(selected)}
							aria-label="Copy"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-4 w-4"
								><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
									d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
								/></svg
							>
						</Button>
					</div>
					{#if copied === selected}
						<p class="animate-in fade-in slide-in-from-top-1 text-xs text-emerald-600">
							Copied to clipboard
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label htmlFor="bulk-ids-list">Bulk IDs ({bulkResults.length})</Label>
						<div class="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => downloadBulkIds('txt')}
								disabled={!bulkResults.length}
								title="Download .txt">.txt</Button
							>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => downloadBulkIds('csv')}
								disabled={!bulkResults.length}
								title="Download .csv">.csv</Button
							>
						</div>
					</div>
					<div
						id="bulk-ids-list"
						class="custom-scrollbar max-h-[300px] min-h-[200px] overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-slate-800 dark:bg-slate-900"
						role="region"
						aria-label="Generated bulk IDs"
					>
						{#if bulkResults.length === 0}
							<p class="text-muted-foreground">
								Use the slider and "Generate IDs" to create multiple IDs at once.
							</p>
						{:else}
							<ul class="space-y-1">
								{#each bulkResults as id}
									<li class="truncate">{id}</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
