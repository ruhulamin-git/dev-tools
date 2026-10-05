<script lang="ts">
	import { showCheatsheet } from '../utils/editorStore';
	import { X } from '@lucide/svelte';

	let { onInsert }: { onInsert?: (text: string) => void } = $props();
</script>

{#if $showCheatsheet}
	<aside
		class="light-scrollbar z-10 flex h-full w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50 shadow-xl transition-all"
	>
		<div
			class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4"
		>
			<h2 class="font-bold text-slate-800">Markdown Guide</h2>
			<button
				onclick={() => ($showCheatsheet = false)}
				class="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
			>
				<X size={18} />
			</button>
		</div>

		<div class="flex-1 space-y-6 overflow-y-auto p-4 text-sm">
			<div class="mb-2 text-xs text-slate-700 italic">Click code to insert</div>

			<section>
				<h3 class="mb-2 border-b pb-1 font-semibold text-slate-900">Typography</h3>
				<div class="space-y-2">
					<button class="group w-full text-left" onclick={() => onInsert?.('# Heading 1')}>
						<p class="mb-1 text-xs text-slate-700">Heading 1</p>
						<code
							class="block rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors hover:border-blue-500"
							># Heading 1</code
						>
					</button>
					<button class="group w-full text-left" onclick={() => onInsert?.('## Heading 2')}>
						<code
							class="block rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors hover:border-blue-500"
							>## Heading 2</code
						>
					</button>
				</div>
			</section>

			<section>
				<h3 class="mb-2 border-b pb-1 font-semibold text-slate-900">Emphasis</h3>
				<div class="space-y-2">
					<button
						class="group flex w-full items-center justify-between text-left"
						onclick={() => onInsert?.('**bold**')}
					>
						<span class="text-slate-800">Bold</span>
						<code
							class="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-slate-900 transition-colors group-hover:border-blue-500"
							>**text**</code
						>
					</button>
					<button
						class="group flex w-full items-center justify-between text-left"
						onclick={() => onInsert?.('*italic*')}
					>
						<span class="text-slate-800">Italic</span>
						<code
							class="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-slate-900 transition-colors group-hover:border-blue-500"
							>*text*</code
						>
					</button>
					<button
						class="group flex w-full items-center justify-between text-left"
						onclick={() => onInsert?.('~~strike~~')}
					>
						<span class="text-slate-800">Strike</span>
						<code
							class="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-slate-900 transition-colors group-hover:border-blue-500"
							>~~text~~</code
						>
					</button>
				</div>
			</section>

			<section>
				<h3 class="mb-2 border-b pb-1 font-semibold text-slate-900">Lists</h3>
				<div class="space-y-2">
					<button class="group w-full text-left" onclick={() => onInsert?.('- Item')}>
						<p class="mb-1 text-xs text-slate-700">Unordered</p>
						<code
							class="block rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors group-hover:border-blue-500"
							>- Item</code
						>
					</button>
					<button class="group w-full text-left" onclick={() => onInsert?.('1. Item')}>
						<p class="mb-1 text-xs text-slate-700">Ordered</p>
						<code
							class="block rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors group-hover:border-blue-500"
							>1. Item</code
						>
					</button>
					<button class="group w-full text-left" onclick={() => onInsert?.('- [ ] Task')}>
						<p class="mb-1 text-xs text-slate-700">Task List</p>
						<code
							class="block rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors group-hover:border-blue-500"
							>- [ ] Task</code
						>
					</button>
				</div>
			</section>

			<section>
				<h3 class="mb-2 border-b pb-1 font-semibold text-slate-900">Code</h3>
				<div class="space-y-2">
					<button class="group w-full text-left" onclick={() => onInsert?.('`code`')}>
						<code
							class="block rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors group-hover:border-blue-500"
							>`inline code`</code
						>
					</button>
					<button
						class="group w-full text-left"
						onclick={() => onInsert?.('```js\nconsole.log(1);\n```')}
					>
						<div
							class="rounded border border-slate-200 bg-slate-100 p-2 text-slate-900 transition-colors group-hover:border-blue-500"
						>
							<pre class="text-xs">```js
...
```</pre>
						</div>
					</button>
				</div>
			</section>

			<section>
				<h3 class="mb-2 border-b pb-1 font-semibold text-slate-900">Shortcuts</h3>
				<div class="grid grid-cols-2 gap-2 text-xs text-slate-800">
					<span>Bold</span>
					<span class="text-right font-mono">Ctrl + B</span>
					<span>Italic</span>
					<span class="text-right font-mono">Ctrl + I</span>
					<span>Link</span>
					<span class="text-right font-mono">Ctrl + K</span>
					<span>Indent</span>
					<span class="text-right font-mono">Tab</span>
				</div>
			</section>
		</div>
	</aside>
{/if}
