<script lang="ts">
	import { Card } from '$lib/shared/components';

	interface Props {
		hue: number;
		saturationValue: number;
		brightnessValue: number;
		alpha: number;
		selectedColor: string;
		pureHueColor: string;
		onPickerMouseDown: (e: MouseEvent) => void;
		onAlphaChange: (value: number) => void;
		pickerRef: HTMLDivElement | null;
	}

	let {
		hue = $bindable(),
		saturationValue,
		brightnessValue,
		alpha,
		selectedColor,
		pureHueColor,
		onPickerMouseDown,
		onAlphaChange,
		pickerRef = $bindable()
	}: Props = $props();
</script>

<Card class="p-4">
	<!-- Saturation/Brightness Picker Canvas -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={pickerRef}
		class="relative mb-4 aspect-4/3 w-full cursor-crosshair overflow-hidden rounded-lg"
		style="background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), {pureHueColor};"
		onmousedown={onPickerMouseDown}
	>
		<!-- Picker Handle -->
		<div
			class="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
			style="left: {saturationValue}%; top: {100 -
				brightnessValue}%; background-color: {selectedColor};"
		></div>
	</div>

	<!-- Hue Slider -->
	<div class="mb-4 flex items-center gap-3">
		<span class="w-10 text-xs font-bold text-slate-500 dark:text-slate-400">HUE</span>
		<input
			type="range"
			min="0"
			max="360"
			bind:value={hue}
			class="hue-slider h-3 flex-1 cursor-pointer appearance-none rounded-lg"
			aria-label="Hue"
		/>
		<span class="w-10 text-right font-mono text-xs text-slate-600 dark:text-slate-300">{hue}°</span>
	</div>

	<!-- Saturation Display -->
	<div class="mb-4 flex items-center gap-3">
		<span class="w-10 text-xs font-bold text-slate-500 dark:text-slate-400">SAT</span>
		<div class="relative h-2 flex-1 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
			<div
				class="absolute inset-y-0 left-0 rounded-lg bg-blue-500"
				style="width: {saturationValue}%;"
			></div>
		</div>
		<span class="w-10 text-right font-mono text-xs text-slate-600 dark:text-slate-300"
			>{saturationValue}%</span
		>
	</div>

	<!-- Brightness Display -->
	<div class="mb-4 flex items-center gap-3">
		<span class="w-10 text-xs font-bold text-slate-500 dark:text-slate-400">BRT</span>
		<div class="relative h-2 flex-1 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
			<div
				class="absolute inset-y-0 left-0 rounded-lg bg-blue-500"
				style="width: {brightnessValue}%;"
			></div>
		</div>
		<span class="w-10 text-right font-mono text-xs text-slate-600 dark:text-slate-300"
			>{brightnessValue}%</span
		>
	</div>

	<!-- Alpha Slider -->
	<div class="flex items-center gap-3">
		<span class="w-10 text-xs font-bold text-slate-500 dark:text-slate-400">ALPHA</span>
		<input
			type="range"
			min="0"
			max="1"
			step="0.01"
			value={alpha}
			oninput={(e) => onAlphaChange(parseFloat((e.target as HTMLInputElement).value))}
			class="alpha-slider h-3 flex-1 cursor-pointer appearance-none rounded-lg"
			aria-label="Alpha"
		/>
		<span class="w-10 text-right font-mono text-xs text-slate-600 dark:text-slate-300"
			>{Math.round(alpha * 100)}%</span
		>
	</div>
</Card>

<style>
	.hue-slider {
		background: linear-gradient(
			to right,
			#f00 0%,
			#ff0 17%,
			#0f0 33%,
			#0ff 50%,
			#00f 67%,
			#f0f 83%,
			#f00 100%
		);
	}

	.hue-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #ffffff;
		border: 2px solid #e2e8f0;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .hue-slider::-webkit-slider-thumb {
		background: #f8fafc;
		border-color: #475569;
	}

	.hue-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #ffffff;
		border: 2px solid #e2e8f0;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .hue-slider::-moz-range-thumb {
		background: #f8fafc;
		border-color: #475569;
	}

	.alpha-slider {
		background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%);
	}

	.alpha-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #ffffff;
		border: 2px solid #e2e8f0;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .alpha-slider::-webkit-slider-thumb {
		background: #f8fafc;
		border-color: #475569;
	}

	.alpha-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #ffffff;
		border: 2px solid #e2e8f0;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .alpha-slider::-moz-range-thumb {
		background: #f8fafc;
		border-color: #475569;
	}
</style>
