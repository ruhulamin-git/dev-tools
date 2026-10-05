<script lang="ts">
	import { Checkbox, Label } from '$lib/shared/components/ui';

	interface Props {
		includeUppercase: boolean;
		includeLowercase: boolean;
		includeNumbers: boolean;
		includeSymbols: boolean;
		onChange: (option: string, value: boolean) => boolean; // Returns true if change was allowed
	}

	let { includeUppercase, includeLowercase, includeNumbers, includeSymbols, onChange }: Props =
		$props();

	const handleChange = (option: string, e: Event) => {
		const target = e.target as HTMLInputElement;
		const newValue = target.checked;

		let currentValue: boolean;
		switch (option) {
			case 'uppercase':
				currentValue = includeUppercase;
				break;
			case 'lowercase':
				currentValue = includeLowercase;
				break;
			case 'numbers':
				currentValue = includeNumbers;
				break;
			case 'symbols':
				currentValue = includeSymbols;
				break;
			default:
				return;
		}

		if (newValue === currentValue) {
			return;
		}

		const allowed = onChange(option, newValue);

		if (!allowed) {
			e.preventDefault();
			e.stopPropagation();
			target.checked = currentValue;
		}
	};
</script>

<div class="space-y-2">
	<Label>Character Types</Label>
	<div class="space-y-2">
		<div class="flex items-center gap-2">
			<Checkbox
				id="uppercase"
				checked={includeUppercase}
				onchange={(e) => handleChange('uppercase', e)}
				ariaLabel="Include uppercase letters"
			/>
			<Label htmlFor="uppercase" class="cursor-pointer font-normal">Uppercase Letters (A-Z)</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				id="lowercase"
				checked={includeLowercase}
				onchange={(e) => handleChange('lowercase', e)}
				ariaLabel="Include lowercase letters"
			/>
			<Label htmlFor="lowercase" class="cursor-pointer font-normal">Lowercase Letters (a-z)</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				id="numbers"
				checked={includeNumbers}
				onchange={(e) => handleChange('numbers', e)}
				ariaLabel="Include numbers"
			/>
			<Label htmlFor="numbers" class="cursor-pointer font-normal">Numbers (0-9)</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				id="symbols"
				checked={includeSymbols}
				onchange={(e) => handleChange('symbols', e)}
				ariaLabel="Include symbols"
			/>
			<Label htmlFor="symbols" class="cursor-pointer font-normal">Symbols (!@#$%^&*...)</Label>
		</div>
	</div>
</div>
