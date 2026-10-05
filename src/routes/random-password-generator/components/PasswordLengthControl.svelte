<script lang="ts">
	import { Input, Label, Slider } from '$lib/shared/components/ui';

	interface Props {
		length: number;
		onChange: (length: number) => void;
	}

	let { length = $bindable(16), onChange }: Props = $props();

	const MIN_LENGTH = 4;
	const MAX_LENGTH = 50;

	const handleSliderChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const newLength = parseInt(target.value, 10);
		length = newLength;
		onChange(newLength);
	};

	const handleInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const newLength = parseInt(target.value, 10);
		if (newLength >= MIN_LENGTH && newLength <= MAX_LENGTH) {
			length = newLength;
			onChange(newLength);
		}
	};
</script>

<div class="space-y-2">
	<div class="space-y-2">
		<Label htmlFor="length">Password Length: {length}</Label>
		<div class="flex items-center gap-4">
			<Slider
				id="length"
				bind:value={length}
				min={MIN_LENGTH}
				max={MAX_LENGTH}
				step="1"
				class="flex-1"
				oninput={handleSliderChange}
				ariaLabel="Password length"
			/>
			<Input
				type="number"
				bind:value={length}
				min={MIN_LENGTH}
				max={MAX_LENGTH}
				class="w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				oninput={handleInputChange}
				ariaLabel="Password length"
			/>
		</div>
	</div>
</div>
