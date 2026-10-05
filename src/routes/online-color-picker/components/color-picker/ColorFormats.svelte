<script lang="ts">
	import { Card, Input } from '$lib/shared/components';
	import { Copy, Check } from '$lib/shared/icons';

	interface RGB {
		r: number;
		g: number;
		b: number;
	}

	interface HSL {
		h: number;
		s: number;
		l: number;
	}

	interface CMYK {
		c: number;
		m: number;
		y: number;
		k: number;
	}

	interface Props {
		selectedColor: string;
		rgb: RGB;
		hsl: HSL;
		cmyk: CMYK;
		rgbaString: string;
		hslaString: string;
		copiedField: string | null;
		onHexInput: (e: Event) => void;
		onCopy: (text: string, field: string) => void;
	}

	let {
		selectedColor,
		rgb,
		hsl,
		cmyk,
		rgbaString,
		hslaString,
		copiedField,
		onHexInput,
		onCopy
	}: Props = $props();
</script>

<Card class="overflow-hidden">
	<div
		class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-700/50"
	>
		<h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Color Values</h2>
		<button
			class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
			onclick={() =>
				onCopy(
					`HEX: ${selectedColor}\nRGB: ${rgb.r}, ${rgb.g}, ${rgb.b}\nHSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%\nCMYK: ${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
					'all'
				)}
		>
			{copiedField === 'all' ? 'Copied!' : 'Copy All'}
		</button>
	</div>
	<div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
		<!-- HEX -->
		<div class="group relative">
			<span class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">HEX</span>
			<div class="relative flex items-center">
				<Input
					value={selectedColor}
					oninput={onHexInput}
					class="pr-10 font-mono"
					ariaLabel="HEX color value"
				/>
				<button
					class="absolute right-2 cursor-pointer p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-600"
					onclick={() => onCopy(selectedColor, 'hex')}
					aria-label="Copy HEX"
				>
					{#if copiedField === 'hex'}
						<Check class="h-4 w-4 text-green-500" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- RGB -->
		<div class="group relative">
			<span class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">RGB</span>
			<div class="relative flex items-center">
				<Input
					value="{rgb.r}, {rgb.g}, {rgb.b}"
					readonly
					class="pr-10 font-mono"
					ariaLabel="RGB color value"
				/>
				<button
					class="absolute right-2 cursor-pointer p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-600"
					onclick={() => onCopy(`${rgb.r}, ${rgb.g}, ${rgb.b}`, 'rgb')}
					aria-label="Copy RGB"
				>
					{#if copiedField === 'rgb'}
						<Check class="h-4 w-4 text-green-500" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- RGBA -->
		<div class="group relative">
			<span class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">RGBA</span>
			<div class="relative flex items-center">
				<Input value={rgbaString} readonly class="pr-10 font-mono" ariaLabel="RGBA color value" />
				<button
					class="absolute right-2 cursor-pointer p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-600"
					onclick={() => onCopy(rgbaString, 'rgba')}
					aria-label="Copy RGBA"
				>
					{#if copiedField === 'rgba'}
						<Check class="h-4 w-4 text-green-500" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- HSL -->
		<div class="group relative">
			<span class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">HSL</span>
			<div class="relative flex items-center">
				<Input
					value="{hsl.h}°, {hsl.s}%, {hsl.l}%"
					readonly
					class="pr-10 font-mono"
					ariaLabel="HSL color value"
				/>
				<button
					class="absolute right-2 cursor-pointer p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-600"
					onclick={() => onCopy(`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, 'hsl')}
					aria-label="Copy HSL"
				>
					{#if copiedField === 'hsl'}
						<Check class="h-4 w-4 text-green-500" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- HSLA -->
		<div class="group relative">
			<span class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">HSLA</span>
			<div class="relative flex items-center">
				<Input value={hslaString} readonly class="pr-10 font-mono" ariaLabel="HSLA color value" />
				<button
					class="absolute right-2 cursor-pointer p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-600"
					onclick={() => onCopy(hslaString, 'hsla')}
					aria-label="Copy HSLA"
				>
					{#if copiedField === 'hsla'}
						<Check class="h-4 w-4 text-green-500" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<!-- CMYK -->
		<div class="group relative">
			<span class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">CMYK</span>
			<div class="relative flex items-center">
				<Input
					value="{cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%"
					readonly
					class="pr-10 font-mono"
					ariaLabel="CMYK color value"
				/>
				<button
					class="absolute right-2 cursor-pointer p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-600"
					onclick={() => onCopy(`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`, 'cmyk')}
					aria-label="Copy CMYK"
				>
					{#if copiedField === 'cmyk'}
						<Check class="h-4 w-4 text-green-500" />
					{:else}
						<Copy class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>
	</div>
</Card>
