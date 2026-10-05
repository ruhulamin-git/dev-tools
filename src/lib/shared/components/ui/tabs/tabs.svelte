<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	let { value = $bindable(), onValueChange, children, class: className = undefined } = $props();

	const activeValue = writable(value);

	$effect(() => {
		activeValue.set(value);
	});

	activeValue.subscribe((v) => {
		value = v;
		onValueChange?.(v);
	});

	setContext('tabs', activeValue);
</script>

<div class={className}>{@render children?.()}</div>
