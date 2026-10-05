<script lang="ts">
	import { Input, Label } from '$lib/shared/components/ui';

	interface Props {
		minUppercase: number;
		minNumbers: number;
		minSymbols: number;
		onChange: (type: 'uppercase' | 'numbers' | 'symbols', value: number) => void;
	}

	let { minUppercase = 0, minNumbers = 0, minSymbols = 0, onChange }: Props = $props();

	const handleChange = (type: 'uppercase' | 'numbers' | 'symbols', value: string) => {
		const numValue = Math.max(0, parseInt(value, 10) || 0);
		onChange(type, numValue);
	};
</script>

<div class="space-y-2">
	<Label>Required Character Counts</Label>
	<div class="space-y-2">
		<div class="flex items-center gap-2">
			<Label htmlFor="min-uppercase" class="w-32 text-sm font-normal">Min Uppercase:</Label>
			<Input
				id="min-uppercase"
				type="number"
				min="0"
				value={minUppercase}
				oninput={(e) => handleChange('uppercase', (e.target as HTMLInputElement).value)}
				class="w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				ariaLabel="Minimum uppercase characters"
			/>
		</div>
		<div class="flex items-center gap-2">
			<Label htmlFor="min-numbers" class="w-32 text-sm font-normal">Min Numbers:</Label>
			<Input
				id="min-numbers"
				type="number"
				min="0"
				value={minNumbers}
				oninput={(e) => handleChange('numbers', (e.target as HTMLInputElement).value)}
				class="w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				ariaLabel="Minimum numbers"
			/>
		</div>
		<div class="flex items-center gap-2">
			<Label htmlFor="min-symbols" class="w-32 text-sm font-normal">Min Symbols:</Label>
			<Input
				id="min-symbols"
				type="number"
				min="0"
				value={minSymbols}
				oninput={(e) => handleChange('symbols', (e.target as HTMLInputElement).value)}
				class="w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				ariaLabel="Minimum symbols"
			/>
		</div>
	</div>
</div>
