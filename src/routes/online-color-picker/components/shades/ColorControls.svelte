<script lang="ts">
	import { Card, Input, Slider } from '$lib/shared/components';

	interface Props {
		baseColor: string;
		steps: number;
		format: 'hex' | 'rgb' | 'hsl';
		onColorInput: (e: Event) => void;
		onStepsChange: (steps: number) => void;
		onFormatChange: (format: 'hex' | 'rgb' | 'hsl') => void;
	}

	let {
		baseColor,
		steps = $bindable(),
		format,
		onColorInput,
		onStepsChange,
		onFormatChange
	}: Props = $props();
</script>

<Card class="p-6 lg:p-8">
	<div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
		<!-- Base Color Picker -->
		<div class="flex items-center gap-6 lg:col-span-5">
			<div class="relative">
				<div
					class="h-24 w-24 cursor-pointer overflow-hidden rounded-xl shadow-lg ring-2 ring-slate-200 dark:ring-slate-600"
					style="background-color: {baseColor};"
				>
					<input
						type="color"
						value={baseColor}
						oninput={onColorInput}
						class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						aria-label="Pick base color"
					/>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-xs font-bold text-slate-500 uppercase dark:text-slate-400"
					>Base Color</span
				>
				<div class="relative">
					<span
						class="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-slate-400 dark:text-slate-500"
						>#</span
					>
					<Input
						value={baseColor.replace('#', '')}
						oninput={onColorInput}
						class="w-full pl-7 font-mono text-lg font-bold uppercase"
						ariaLabel="Base color HEX value"
					/>
				</div>
			</div>
		</div>

		<div
			class="hidden h-20 w-px bg-slate-200 lg:col-span-1 lg:mx-auto lg:block dark:bg-slate-700"
		></div>

		<!-- Settings -->
		<div class="flex flex-col gap-6 lg:col-span-6">
			<!-- Steps Slider -->
			<div class="flex flex-col gap-3">
				<div class="flex items-end justify-between">
					<label for="steps-slider" class="text-sm font-bold text-slate-700">Quantity</label>
					<span class="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{steps}</span>
				</div>
				<div id="steps-slider">
					<Slider bind:value={steps} min={3} max={12} />
				</div>
				<div
					class="flex justify-between text-[10px] font-medium tracking-wider text-slate-400 uppercase"
				>
					<span>Min (3)</span>
					<span>Max (12)</span>
				</div>
			</div>

			<!-- Format Selector -->
			<div class="flex items-center gap-4">
				<span id="format-label" class="text-sm font-medium text-slate-500 dark:text-slate-400">
					Format:
				</span>
				<div
					role="group"
					aria-labelledby="format-label"
					class="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-700"
				>
					<button
						class="rounded px-3 py-1 text-xs font-medium transition-all {format === 'hex'
							? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600'
							: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
						onclick={() => onFormatChange('hex')}
					>
						HEX
					</button>
					<button
						class="rounded px-3 py-1 text-xs font-medium transition-all {format === 'rgb'
							? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600'
							: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
						onclick={() => onFormatChange('rgb')}
					>
						RGB
					</button>
					<button
						class="rounded px-3 py-1 text-xs font-medium transition-all {format === 'hsl'
							? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600'
							: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
						onclick={() => onFormatChange('hsl')}
					>
						HSL
					</button>
				</div>
			</div>
		</div>
	</div>
</Card>
