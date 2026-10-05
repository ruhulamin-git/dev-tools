<script lang="ts">
	// @ts-ignore - svelte-codemirror-editor has no types
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '../utils/editorStore';
	// @ts-ignore - codemirror packages have no type declarations in this project
	import { markdown as markdownLang } from '@codemirror/lang-markdown';
	// @ts-ignore
	import { EditorView, keymap, placeholder } from '@codemirror/view';
	// @ts-ignore
	import { indentWithTab } from '@codemirror/commands';
	import { Copy, Check } from '@lucide/svelte';

	let {
		view = $bindable(),
		onScroll,
		scrollTop
	}: {
		view?: EditorView;
		onScroll?: (scrollTop: number, scrollRatio: number) => void;
		scrollTop?: number;
	} = $props();

	let isRemoteScrolling = false;
	let copied = $state(false);

	let isDarkMode = $state(false);

	function copyToClipboard() {
		if (!navigator.clipboard) return;
		navigator.clipboard.writeText($markdown).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	$effect(() => {
		if (!view || scrollTop === undefined) return;
		const scroller = view.scrollDOM;
		const result = scroller.scrollTop;
		if (Math.abs(result - scrollTop) > 10) {
			isRemoteScrolling = true;
			scroller.scrollTop = scrollTop;
			setTimeout(() => (isRemoteScrolling = false), 100);
		}
	});

	const lightTheme = EditorView.theme(
		{
			'&': {
				backgroundColor: '#ffffff',
				color: '#333333',
				height: '100%'
			},
			'.cm-content': {
				caretColor: '#000000'
			},
			'.cm-gutters': {
				backgroundColor: '#f5f5f5',
				color: '#999999',
				borderRight: '1px solid #e5e5e5'
			},
			'.cm-lineNumbers': {
				color: '#999'
			}
		},
		{ dark: false }
	);

	const editorKeymap = keymap.of([
		indentWithTab,
		{
			key: 'Mod-b',
			run: (v: EditorView) => {
				const { from, to } = v.state.selection.main;
				v.dispatch({
					changes: { from, to, insert: `**${v.state.sliceDoc(from, to)}**` },
					selection: { anchor: from + 2, head: to + 2 }
				});
				return true;
			}
		},
		{
			key: 'Mod-i',
			run: (v: EditorView) => {
				const { from, to } = v.state.selection.main;
				v.dispatch({
					changes: { from, to, insert: `*${v.state.sliceDoc(from, to)}*` },
					selection: { anchor: from + 1, head: to + 1 }
				});
				return true;
			}
		}
	]);

	function handleReady(v: EditorView) {
		view = v;
	}

	$effect(() => {
		if (!view) return;
		const scroller = view.scrollDOM;
		const handleScroll = () => {
			if (isRemoteScrolling) return;
			if (onScroll) {
				const { scrollTop, scrollHeight, clientHeight } = scroller;
				const maxScroll = scrollHeight - clientHeight;
				const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
				onScroll(scrollTop, ratio);
			}
		};
		scroller.addEventListener('scroll', handleScroll);
		return () => scroller.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="group relative h-full w-full overflow-hidden font-mono text-[15px]">
	<div class="editor-wrapper">
		{#if !view}
			<div class="absolute inset-0 z-20 flex items-center justify-center text-slate-400 italic">
				Loading editor...
			</div>
		{/if}
		<button
			class="absolute top-4 right-6 z-10 rounded-lg border border-slate-200/50 bg-white/50 p-2 text-slate-500 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white/80 hover:text-blue-500"
			onclick={copyToClipboard}
			title="Copy Markdown"
		>
			{#if copied}
				<Check size={16} class="text-green-500" />
			{:else}
				<Copy size={16} />
			{/if}
		</button>
		<div class:opacity-0={!view} class="h-full transition-opacity duration-200">
			<CodeMirror
				bind:value={$markdown}
				lang={markdownLang()}
				theme={lightTheme}
				onready={handleReady}
				extensions={[
					editorKeymap,
					EditorView.lineWrapping,
					placeholder('Type your markdown here...'),
					EditorView.contentAttributes.of({ 'aria-label': 'Markdown editor' })
				]}
				styles={{
					'&': { height: '100%', width: '100%' },
					'.cm-scroller': {
						fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
						overflow: 'auto'
					}
				}}
				tabSize={4}
				lineWrapping={true}
			/>
		</div>
	</div>
</div>

<style>
	.editor-wrapper {
		display: flex;
		flex-direction: column;
		position: absolute;
		inset: 0;
	}
	:global(.editor-wrapper > div:last-child) {
		flex: 1;
		min-height: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	:global(.editor-wrapper .codemirror-wrapper) {
		height: 100% !important;
		flex: 1;
		min-height: 0;
	}
	:global(.cm-editor) {
		height: 100% !important;
		max-height: 100%;
	}
	:global(.cm-scroller) {
		overflow-y: auto !important;
		overflow-x: auto !important;
	}
	:global(.cm-scroller::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}
	:global(.cm-scroller::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.cm-scroller::-webkit-scrollbar-thumb) {
		background: #cbd5e1; /* slate-300 */
		border-radius: 4px;
	}
	:global(.cm-scroller::-webkit-scrollbar-thumb:hover) {
		background: #94a3b8; /* slate-400 */
	}
	:global(.cm-placeholder) {
		color: #64748b !important; /* slate-500 - better contrast ratio */
		font-style: italic;
	}
</style>
