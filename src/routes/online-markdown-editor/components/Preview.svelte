<script lang="ts">
	import { markdown } from '../utils/editorStore';
	import { parseMarkdown } from '../utils/markdownParser';
	import { Copy, Check } from '@lucide/svelte';

	let {
		scrollRatio = 0,
		onScroll
	}: {
		scrollRatio?: number;
		onScroll?: (scrollTop: number, ratio: number) => void;
	} = $props();

	let htmlContent = $state('');
	let container: HTMLElement;
	let isRemoteScrolling = false;
	let copied = $state(false);

	$effect(() => {
		const content = $markdown;
		parseMarkdown(content).then((html) => {
			htmlContent = html;
		});
	});

	function copyToClipboard() {
		if (!container || !navigator.clipboard) return;
		const text = container.innerText;
		navigator.clipboard.writeText(text).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	$effect(() => {
		if (!container) return;
		const { scrollHeight, clientHeight, scrollTop } = container;
		const maxScroll = scrollHeight - clientHeight;
		if (maxScroll > 0) {
			const desiredScroll = maxScroll * scrollRatio;
			if (Math.abs(scrollTop - desiredScroll) > 10) {
				isRemoteScrolling = true;
				container.scrollTop = desiredScroll;
				setTimeout(() => (isRemoteScrolling = false), 100);
			}
		}
	});

	function handleScroll() {
		if (!container || !onScroll) return;
		if (isRemoteScrolling) return;
		const { scrollTop, scrollHeight, clientHeight } = container;
		const maxScroll = scrollHeight - clientHeight;
		const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
		onScroll(scrollTop, ratio);
	}
</script>

<div class="group relative h-full w-full">
	<button
		class="absolute top-4 right-6 z-10 rounded-lg border border-slate-200/50 bg-white/50 p-2 text-slate-500 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white/80 hover:text-blue-500"
		onclick={copyToClipboard}
		title="Copy Text"
	>
		{#if copied}
			<Check size={16} class="text-green-500" />
		{:else}
			<Copy size={16} />
		{/if}
	</button>
	<div
		bind:this={container}
		onscroll={handleScroll}
		class="light-scrollbar h-full w-full overflow-y-auto scroll-smooth bg-white p-8 transition-colors duration-300 ease-in-out"
	>
		<article id="markdown-preview" class="markdown-body">
			{@html htmlContent}
		</article>
	</div>
</div>

<style>
	/* GitHub-flavored Markdown styles */
	.markdown-body {
		color: #24292f;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
		font-size: 16px;
		line-height: 1.6;
		word-wrap: break-word;
	}

	/* Paragraphs */
	.markdown-body :global(p) {
		margin-top: 0;
		margin-bottom: 16px;
	}

	/* Headings */
	.markdown-body :global(h1),
	.markdown-body :global(h2),
	.markdown-body :global(h3),
	.markdown-body :global(h4),
	.markdown-body :global(h5),
	.markdown-body :global(h6) {
		margin-top: 24px;
		margin-bottom: 16px;
		font-weight: 600;
		line-height: 1.25;
	}

	.markdown-body :global(h1) {
		font-size: 2em;
	}

	.markdown-body :global(h2) {
		font-size: 1.5em;
	}

	.markdown-body :global(h3) {
		font-size: 1.25em;
	}

	.markdown-body :global(h4) {
		font-size: 1em;
	}

	.markdown-body :global(h5) {
		font-size: 0.875em;
	}

	.markdown-body :global(h6) {
		font-size: 0.85em;
		color: #656d76;
	}

	/* Links */
	.markdown-body :global(a) {
		color: #0969da;
		text-decoration: none;
	}

	.markdown-body :global(a:hover) {
		text-decoration: underline;
	}

	/* Bold and Italic */
	.markdown-body :global(strong) {
		font-weight: 600;
	}

	.markdown-body :global(em) {
		font-style: italic;
	}

	/* Lists */
	.markdown-body :global(ul),
	.markdown-body :global(ol) {
		margin-top: 0;
		margin-bottom: 16px;
		padding-left: 2em;
	}

	.markdown-body :global(ul) {
		list-style-type: disc;
	}

	.markdown-body :global(ol) {
		list-style-type: decimal;
	}

	.markdown-body :global(li) {
		margin-top: 0.25em;
	}

	.markdown-body :global(li + li) {
		margin-top: 0.25em;
	}

	/* Nested lists */
	.markdown-body :global(ul ul),
	.markdown-body :global(ol ol),
	.markdown-body :global(ul ol),
	.markdown-body :global(ol ul) {
		margin-top: 0;
		margin-bottom: 0;
	}

	/* Blockquotes */
	.markdown-body :global(blockquote) {
		margin: 0 0 16px 0;
		padding: 0 1em;
		color: #656d76;
		border-left: 0.25em solid #d1d9e0;
	}

	/* Code - Inline */
	.markdown-body :global(code) {
		padding: 0.2em 0.4em;
		margin: 0;
		font-size: 85%;
		font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
		background-color: rgba(175, 184, 193, 0.2);
		border-radius: 6px;
		white-space: break-spaces;
	}

	/* Code - Block */
	.markdown-body :global(pre) {
		margin-top: 0;
		margin-bottom: 16px;
		padding: 16px;
		overflow: auto;
		font-size: 85%;
		line-height: 1.45;
		background-color: #f6f8fa;
		border-radius: 6px;
		color: #24292f;
	}

	.markdown-body :global(pre code) {
		padding: 0;
		margin: 0;
		font-size: 100%;
		background-color: transparent;
		border-radius: 0;
		white-space: pre;
		word-break: normal;
		color: inherit;
	}

	/* Tables */
	.markdown-body :global(table) {
		display: block;
		width: max-content;
		max-width: 100%;
		overflow: auto;
		margin-top: 0;
		margin-bottom: 16px;
		border-spacing: 0;
		border-collapse: collapse;
	}

	.markdown-body :global(table th),
	.markdown-body :global(table td) {
		padding: 6px 13px;
		border: 1px solid #d1d9e0;
		color: #24292f;
	}

	.markdown-body :global(table th) {
		font-weight: 600;
		background-color: #f6f8fa;
		color: #24292f;
	}

	.markdown-body :global(table tr) {
		background-color: #ffffff;
		border-top: 1px solid #d1d9e0;
	}

	.markdown-body :global(table tr:nth-child(2n)) {
		background-color: #f6f8fa;
	}

	.markdown-body :global(table tbody tr) {
		color: #24292f;
	}

	/* Horizontal Rule */
	.markdown-body :global(hr) {
		height: 0.25em;
		padding: 0;
		margin: 24px 0;
		background-color: #d1d9e0;
		border: 0;
	}

	/* Images */
	.markdown-body :global(img) {
		max-width: 100%;
		box-sizing: border-box;
		border-radius: 6px;
	}

	/* Task Lists */
	.markdown-body :global(input[type='checkbox']) {
		margin-right: 0.5em;
		vertical-align: middle;
	}

	/* Syntax Highlighting */
	.markdown-body :global(.token.comment),
	.markdown-body :global(.token.prolog),
	.markdown-body :global(.token.doctype),
	.markdown-body :global(.token.cdata) {
		color: #6a737d;
	}

	.markdown-body :global(.token.punctuation) {
		color: #24292f;
	}

	.markdown-body :global(.token.property),
	.markdown-body :global(.token.tag),
	.markdown-body :global(.token.boolean),
	.markdown-body :global(.token.number),
	.markdown-body :global(.token.constant),
	.markdown-body :global(.token.symbol),
	.markdown-body :global(.token.deleted) {
		color: #005cc5;
	}

	.markdown-body :global(.token.selector),
	.markdown-body :global(.token.attr-name),
	.markdown-body :global(.token.string),
	.markdown-body :global(.token.char),
	.markdown-body :global(.token.builtin),
	.markdown-body :global(.token.inserted) {
		color: #032f62;
	}

	.markdown-body :global(.token.operator),
	.markdown-body :global(.token.entity),
	.markdown-body :global(.token.url),
	.markdown-body :global(.language-css .token.string),
	.markdown-body :global(.style .token.string) {
		color: #24292f;
	}

	.markdown-body :global(.token.atrule),
	.markdown-body :global(.token.attr-value),
	.markdown-body :global(.token.keyword) {
		color: #d73a49;
	}

	.markdown-body :global(.token.function),
	.markdown-body :global(.token.class-name) {
		color: #6f42c1;
	}

	.markdown-body :global(.token.regex),
	.markdown-body :global(.token.important),
	.markdown-body :global(.token.variable) {
		color: #e36209;
	}

	/* Line numbers for code blocks */
	.markdown-body :global(.code-line) {
		display: block;
		padding-left: 16px;
		padding-right: 16px;
		margin-left: -16px;
		margin-right: -16px;
	}

	.markdown-body :global(.line-number::before) {
		display: inline-block;
		width: 1rem;
		text-align: right;
		margin-right: 16px;
		color: #6e7681;
		content: attr(line);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.markdown-body {
		animation: fadeIn 0.2s ease-out;
	}
</style>
