<script lang="ts">
	import { Input } from '$lib/shared/components';

	interface GradientStop {
		color: string;
		position: number;
	}

	interface Props {
		stop: GradientStop;
		canRemove: boolean;
		onUpdateColor: (color: string) => void;
		onUpdatePosition: (position: number) => void;
		onRemove: () => void;
	}

	let { stop, canRemove, onUpdateColor, onUpdatePosition, onRemove }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<span
			class="h-4 w-4 rounded-full ring-2 ring-blue-500 ring-offset-2"
			style="background-color: {stop.color};"
		></span>
		<h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Selected Stop</h2>
	</div>

	<div class="flex flex-col gap-3">
		<!-- Color Input -->
		<div class="flex flex-col gap-1.5">
			<label
				for="stop-color-hex"
				class="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
				>Color</label
			>
			<div class="flex items-center gap-2">
				<div class="relative shrink-0">
					<div
						class="h-10 w-10 rounded-md shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
						style="background-color: {stop.color};"
					></div>
					<input
						type="color"
						value={stop.color}
						oninput={(e) => onUpdateColor((e.target as HTMLInputElement).value.toUpperCase())}
						class="absolute inset-0 cursor-pointer opacity-0"
						aria-label="Pick stop color"
					/>
				</div>
				<Input
					id="stop-color-hex"
					value={stop.color}
					oninput={(e) => onUpdateColor((e.target as HTMLInputElement).value)}
					class="font-mono uppercase"
					placeholder="#000000"
				/>
			</div>
		</div>

		<!-- Position Input -->
		<div class="flex flex-col gap-1.5">
			<label
				for="stop-position-input"
				class="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
				>Position</label
			>
			<div class="flex items-center gap-2">
				<Input
					id="stop-position-input"
					type="number"
					value={stop.position}
					oninput={(e) => onUpdatePosition(parseInt((e.target as HTMLInputElement).value) || 0)}
					min="0"
					max="100"
					class="font-mono"
				/>
				<span class="text-sm font-bold text-slate-400">%</span>
			</div>
		</div>
	</div>

	{#if canRemove}
		<button
			class="mt-1 flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 active:scale-95 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
			onclick={onRemove}
		>
			<span class="text-base">🗑️</span>
			Remove Stop
		</button>
	{/if}
</div>
