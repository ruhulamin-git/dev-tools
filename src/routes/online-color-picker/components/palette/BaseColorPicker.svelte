<script lang="ts">
	import { Card, Input } from '$lib/shared/components';

	interface Props {
		baseColor: string;
		onColorChange: (color: string) => void;
		onColorInput: (e: Event) => void;
	}

	let { baseColor, onColorChange, onColorInput }: Props = $props();
</script>

<Card class="p-6">
	<div class="flex flex-col items-center gap-6 md:flex-row">
		<div class="flex items-center gap-4">
			<div class="relative">
				<div
					class="h-20 w-20 cursor-pointer overflow-hidden rounded-xl shadow-md ring-1 ring-black/5"
					style="background-color: {baseColor};"
				>
					<input
						type="color"
						value={baseColor}
						oninput={(e) => onColorChange((e.target as HTMLInputElement).value.toUpperCase())}
						class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						aria-label="Pick base color"
					/>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<span class="text-xs font-bold text-slate-500 uppercase dark:text-slate-400"
					>Base Color</span
				>
				<Input
					value={baseColor}
					oninput={onColorInput}
					class="w-32 font-mono text-lg font-bold uppercase"
					ariaLabel="Base color HEX value"
				/>
			</div>
		</div>

		<div class="h-px w-full bg-slate-200 md:h-16 md:w-px dark:bg-slate-700"></div>

		<!-- Slot for harmony selector -->
		<slot />
	</div>
</Card>
