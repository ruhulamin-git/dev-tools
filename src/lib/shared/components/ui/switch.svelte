<script lang="ts">
	import { cn } from '$lib/shared/utils';
	let {
		checked = $bindable(false),
		id = undefined,
		ariaLabel = undefined,
		class: className = undefined,
		...rest
	}: {
		checked?: boolean;
		id?: string;
		ariaLabel?: string;
		class?: string;
	} = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={ariaLabel}
	{id}
	onclick={() => (checked = !checked)}
	class={cn(
		'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-900 dark:data-[state=unchecked]:bg-slate-700',
		className
	)}
	data-state={checked ? 'checked' : 'unchecked'}
	{...rest}
>
	<span
		data-state={checked ? 'checked' : 'unchecked'}
		class={cn(
			'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
		)}
	></span>
</button>
