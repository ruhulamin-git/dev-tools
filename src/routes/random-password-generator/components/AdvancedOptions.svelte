<script lang="ts">
	import { Checkbox, Label } from '$lib/shared/components/ui';

	interface Props {
		excludeSimilar: boolean;
		excludeAmbiguous: boolean;
		noRepeat: boolean;
		avoidSequential: boolean;
		onChange: (option: string, value: boolean) => void;
	}

	let {
		excludeSimilar,
		excludeAmbiguous,
		noRepeat,
		avoidSequential = false,
		onChange
	}: Props = $props();
</script>

<div class="space-y-2">
	<Label>Advanced Options</Label>
	<div class="space-y-2">
		<div class="flex items-center gap-2">
			<Checkbox
				id="exclude-similar"
				checked={excludeSimilar}
				onchange={(e) => onChange('excludeSimilar', (e.target as HTMLInputElement).checked)}
				ariaLabel="Exclude similar characters"
			/>
			<Label htmlFor="exclude-similar" class="cursor-pointer font-normal">
				Exclude Similar Characters (i, l, 1, L, o, 0, O)
			</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				id="exclude-ambiguous"
				checked={excludeAmbiguous}
				onchange={(e) => onChange('excludeAmbiguous', (e.target as HTMLInputElement).checked)}
				ariaLabel="Exclude ambiguous characters"
			/>
			<Label htmlFor="exclude-ambiguous" class="cursor-pointer font-normal">
				Exclude Ambiguous Characters (brackets, parentheses, quotes, etc.)
			</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				id="no-repeat"
				checked={noRepeat}
				onchange={(e) => onChange('noRepeat', (e.target as HTMLInputElement).checked)}
				ariaLabel="No repeat characters"
			/>
			<Label htmlFor="no-repeat" class="cursor-pointer font-normal">No Repeat Characters</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox
				id="avoid-sequential"
				checked={avoidSequential}
				onchange={(e) => onChange('avoidSequential', (e.target as HTMLInputElement).checked)}
				ariaLabel="Avoid sequential characters"
			/>
			<Label htmlFor="avoid-sequential" class="cursor-pointer font-normal">
				Avoid Sequential Characters (12345, abcde, aaaa, bbbb)
			</Label>
		</div>
	</div>
</div>
