<script lang="ts">
	import JsonTreeView from './JsonTreeView.svelte';

	interface Props {
		data: unknown;
		expanded?: boolean;
		name?: string;
		isRoot?: boolean;
		depth?: number;
	}

	let { data, expanded = true, name = '', isRoot = true, depth = 0 }: Props = $props();

	const isObject = data !== null && typeof data === 'object';
	const isArray = Array.isArray(data);
	const entries = isObject ? Object.entries(data as Record<string, unknown>) : [];
	const shouldExpand = expanded && entries.length < 20 && depth < 5;
</script>

<div class="pl-4 font-mono text-sm">
	{#if isObject}
		<details open={shouldExpand}>
			<summary
				class="-ml-2 cursor-pointer rounded px-2 py-0.5 transition-colors select-none hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
			>
				{#if !isRoot && name}
					<span class="font-medium text-teal-700 dark:text-teal-400">{name}</span>
					<span class="text-gray-400 dark:text-slate-500">: </span>
				{/if}
				<span class="text-xs text-gray-500 dark:text-slate-400">
					{isArray ? `Array[${entries.length}]` : `Object{${entries.length}}`}
				</span>
			</summary>
			<div
				class="ml-2 border-l-2 border-gray-200 transition-colors hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-600"
			>
				{#each entries as [key, val]}
					<JsonTreeView
						data={val}
						name={key}
						isRoot={false}
						expanded={shouldExpand}
						depth={depth + 1}
					/>
				{/each}
			</div>
		</details>
	{:else}
		<div
			class="-ml-2 rounded px-2 py-0.5 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
		>
			{#if name}
				<span class="font-medium text-teal-700 dark:text-teal-400">{name}</span>
				<span class="text-gray-400 dark:text-slate-500">: </span>
			{/if}
			{#if data === null}
				<span
					class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400 italic dark:bg-slate-700 dark:text-slate-500"
					>null</span
				>
			{:else if typeof data === 'string'}
				<span class="text-emerald-600 dark:text-emerald-400">"{data}"</span>
			{:else if typeof data === 'number'}
				<span class="font-medium text-blue-600 dark:text-blue-400">{data}</span>
			{:else if typeof data === 'boolean'}
				<span class="font-medium text-orange-600 dark:text-orange-400">{data}</span>
			{:else}
				<span class="text-gray-600 dark:text-slate-400">{String(data)}</span>
			{/if}
		</div>
	{/if}
</div>
