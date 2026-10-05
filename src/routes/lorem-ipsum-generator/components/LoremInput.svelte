<script lang="ts">
	import { PLACEHOLDER_LABELS, GENERATION_LABELS, OUTPUT_LABELS } from '../utils/loremGenerator';
	import type { PlaceholderType, GenerationType, OutputFormat } from '../utils/loremGenerator';
	import Select from '$lib/shared/components/ui/select.svelte';
	import Input from '$lib/shared/components/ui/input.svelte';
	import Label from '$lib/shared/components/ui/label.svelte';
	import Button from '$lib/shared/components/ui/button.svelte';
	import Checkbox from '$lib/shared/components/ui/checkbox.svelte';

	interface Props {
		placeholderType: PlaceholderType;
		generationType: GenerationType;
		outputFormat: OutputFormat;
		quantity: number;
		startWithLorem: boolean;
		onPlaceholderTypeChange: (type: PlaceholderType) => void;
		onGenerationTypeChange: (type: GenerationType) => void;
		onOutputFormatChange: (format: OutputFormat) => void;
		onQuantityChange: (qty: number) => void;
		onStartWithLoremChange: (enabled: boolean) => void;
		onGenerate: () => void;
		onReset: () => void;
		isGenerating: boolean;
	}

	let {
		placeholderType,
		generationType,
		outputFormat,
		quantity,
		startWithLorem,
		onPlaceholderTypeChange,
		onGenerationTypeChange,
		onOutputFormatChange,
		onQuantityChange,
		onStartWithLoremChange,
		onGenerate,
		onReset,
		isGenerating
	}: Props = $props();

	const placeholderOptions = Object.entries(PLACEHOLDER_LABELS).map(([value, label]) => ({
		value,
		label
	}));

	const generationOptions = Object.entries(GENERATION_LABELS).map(([value, label]) => ({
		value,
		label
	}));

	const outputOptions = Object.entries(OUTPUT_LABELS).map(([value, label]) => ({
		value,
		label
	}));

	const handleQuantityInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value, 10);
		if (!isNaN(value)) onQuantityChange(Math.min(Math.max(1, value), 1000));
	};
</script>

<div class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
	<div class="rounded-xl border-b border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
		<h2 class="text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">Generator Options</h2>
		<p class="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">Configure your placeholder text generation</p>
	</div>
	<div class="p-4 sm:p-6">
		<!-- Controls Grid -->
		<div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Placeholder Type -->
			<div class="space-y-2">
				<Label htmlFor="placeholder-type" class="text-slate-700 dark:text-slate-300"
					>Placeholder Type</Label
				>
				<Select
					id="placeholder-type"
					value={placeholderType}
					options={placeholderOptions}
					onchange={(v) => onPlaceholderTypeChange(v as PlaceholderType)}
					class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
			</div>

			<!-- Generation Type -->
			<div class="space-y-2">
				<Label htmlFor="generation-type" class="text-slate-700 dark:text-slate-300"
					>Generate By</Label
				>
				<Select
					id="generation-type"
					value={generationType}
					options={generationOptions}
					onchange={(v) => onGenerationTypeChange(v as GenerationType)}
					class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
			</div>

			<!-- Quantity -->
			<div class="space-y-2">
				<Label htmlFor="quantity" class="text-slate-700 dark:text-slate-300"
					>Quantity (1-1000)</Label
				>
				<Input
					id="quantity"
					type="number"
					min="1"
					max="1000"
					value={quantity}
					oninput={handleQuantityInput}
					class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
				/>
			</div>

			<!-- Output Format -->
			<div class="space-y-2">
				<Label htmlFor="output-format" class="text-slate-700 dark:text-slate-300"
					>Output Format</Label
				>
				<Select
					id="output-format"
					value={outputFormat}
					options={outputOptions}
					onchange={(v) => onOutputFormatChange(v as OutputFormat)}
					class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
				/>
			</div>
		</div>

		<!-- Options Row -->
		<div class="mb-6 flex flex-wrap items-center gap-6">
			<div class="flex items-center gap-2">
				<Checkbox
					id="start-lorem"
					checked={startWithLorem}
					onchange={(e) => onStartWithLoremChange((e.target as HTMLInputElement).checked)}
					class="dark:border-slate-600 dark:bg-slate-700"
				/>
				<Label
					htmlFor="start-lorem"
					class="cursor-pointer font-normal text-slate-600 dark:text-slate-400"
				>
					Start with "Lorem ipsum dolor sit amet..."
				</Label>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
			<Button
				onclick={onGenerate}
				disabled={isGenerating}
				class="w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto sm:px-6 dark:bg-slate-700 dark:hover:bg-slate-600"
			>
				{isGenerating ? 'Generating...' : 'Regenerate'}
			</Button>
			<Button
				variant="outline"
				onclick={onReset}
				class="w-full bg-white text-slate-700 sm:w-auto sm:px-6 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
			>
				Reset
			</Button>
		</div>
	</div>
</div>
