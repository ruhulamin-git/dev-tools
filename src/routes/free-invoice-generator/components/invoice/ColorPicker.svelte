<script lang="ts">
	interface Props {
		colors: string[];
		selectedColor: string;
		onSelect?: (color: string) => void;
	}

	let { colors, selectedColor = $bindable(), onSelect }: Props = $props();

	function handleColorSelect(color: string) {
		selectedColor = color;
		onSelect?.(color);
	}
</script>

<div class="grid grid-cols-6 gap-2">
	{#each colors as color}
		<button
			type="button"
			onclick={() => handleColorSelect(color)}
			class="h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
			class:ring-2={selectedColor === color}
			class:ring-offset-2={selectedColor === color}
			class:ring-slate-400={selectedColor === color}
			style="background-color: {color}; border-color: {selectedColor === color
				? color
				: 'transparent'};"
			aria-label="Select {color} color"
			aria-pressed={selectedColor === color}
		></button>
	{/each}
</div>
