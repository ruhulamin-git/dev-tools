<script lang="ts">
	import { Input, Label } from '$lib/shared/components/ui';

	interface Props {
		customSymbols: string;
		onChange: (symbols: string) => void;
	}

	let { customSymbols = '', onChange }: Props = $props();

	const handleChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		onChange(value);
	};
</script>

<div class="space-y-2">
	<div class="space-y-2">
		<Label htmlFor="custom-symbols">Custom Symbols</Label>
		<Input
			id="custom-symbols"
			type="text"
			value={customSymbols}
			oninput={handleChange}
			placeholder="!@#$%^&*€₹"
			class="w-full"
			ariaLabel="Custom symbols"
		/>
		<p class="text-xs text-slate-500 dark:text-slate-400">
			Leave empty to use default symbols. If provided, these will replace the default symbol set.
		</p>
	</div>
</div>
