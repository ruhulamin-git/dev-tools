<script lang="ts">
	import { showPreview, showCheatsheet, markdown } from '../utils/editorStore';
	import { parseMarkdown } from '../utils/markdownParser';
	import {
		Bold,
		Italic,
		Heading1,
		Link,
		Image,
		List,
		Quote,
		Code,
		Table,
		FileText,
		FileCode,
		FileDown,
		PanelLeft,
		Columns2,
		Maximize,
		Minimize
	} from '@lucide/svelte';
	// @ts-ignore - codemirror has no type declarations in this project
	import type { EditorView } from 'codemirror';
	import LinkModal from './LinkModal.svelte';
	import ImageModal from './ImageModal.svelte';
	import { setInnerHTML } from '$lib/shared/utils/trustedTypes';

	let {
		view,
		onOpenTableModal,
		isFullscreen = false,
		onToggleFullscreen
	}: {
		view?: EditorView;
		onOpenTableModal: () => void;
		isFullscreen?: boolean;
		onToggleFullscreen?: () => void;
	} = $props();

	let showLinkModal = $state(false);
	let showImageModal = $state(false);
	let selectedText = $state('');

	function insertText(prefix: string, suffix: string = '') {
		if (!view) return;
		const { state, dispatch: cmDispatch } = view;
		const selection = state.selection.main;
		const selectedText = state.sliceDoc(selection.from, selection.to);
		const text = prefix + selectedText + suffix;
		cmDispatch({
			changes: { from: selection.from, to: selection.to, insert: text },
			selection: {
				anchor: selection.from + prefix.length,
				head: selection.from + prefix.length + selectedText.length
			}
		});
		view.focus();
	}

	function insertBlock(prefix: string) {
		if (!view) return;
		const { state, dispatch: cmDispatch } = view;
		const selection = state.selection.main;
		const line = state.doc.lineAt(selection.from);
		cmDispatch({
			changes: { from: line.from, insert: prefix },
			selection: { anchor: selection.from + prefix.length }
		});
		view.focus();
	}

	function openLinkModal() {
		selectedText =
			view?.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to) || '';
		showLinkModal = true;
	}

	function openImageModal() {
		showImageModal = true;
	}

	function handleLinkInsert(text: string, url: string) {
		if (!view) return;
		const insert = `[${text}](${url})`;
		const { from, to } = view.state.selection.main;
		view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } });
		view.focus();
	}

	function handleImageInsert(alt: string, url: string) {
		if (!view) return;
		const insert = `![${alt}](${url})`;
		const { from, to } = view.state.selection.main;
		view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } });
		view.focus();
	}

	let isEditorReady = $derived(!!view);

	const btnClass =
		'p-2 rounded-md text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-blue-600 hover:scale-105 transform cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent';

	async function handleExport(type: 'md' | 'html' | 'pdf') {
		const content = $markdown;
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
		const time = new Date().toISOString().slice(11, 16).replace(/:/g, '');
		const filename = `markdown-devxhub-${date}-${time}`;

		if (type === 'md') {
			const blob = new Blob([content], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${filename}.md`;
			a.click();
		} else if (type === 'html') {
			const htmlBody = await parseMarkdown(content);
			const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
        @media (prefers-color-scheme: dark) { body { background: #0d1117; color: #c9d1d9; } }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
        code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 85%; }
    </style>
</head>
<body>
${htmlBody}
</body>
</html>`;
			const blob = new Blob([fullHtml], { type: 'text/html' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${filename}.html`;
			a.click();
		} else if (type === 'pdf') {
			try {
				// @ts-ignore
				const html2pdfModule = await import('html2pdf.js');
				const html2pdf = html2pdfModule.default || html2pdfModule;
				const htmlBody = await parseMarkdown(content);

				// Create isolated container
				const container = document.createElement('div');
				container.style.cssText =
					'position: fixed; left: 0; top: 0; z-index: 9999; background: #fff;';

				// PDF wrapper with proper A4 styling
				const pdfWrapper = document.createElement('div');
				pdfWrapper.id = 'pdf-export-content';
				pdfWrapper.style.cssText = `
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    color: #000;
                    background: #fff;
                    width: 210mm;
                    padding: 20mm;
                    box-sizing: border-box;
                `;

				// Add inline styles for markdown elements
				const styledHtml = `
                    <style>
                        #pdf-export-content * { color: #000 !important; background: transparent !important; }
                        #pdf-export-content h1 { font-size: 24pt !important; font-weight: bold !important; margin: 16pt 0 8pt !important; padding-bottom: 0 !important; border-bottom: none !important; }
                        #pdf-export-content h2 { font-size: 18pt !important; font-weight: bold !important; margin: 14pt 0 6pt !important; padding-bottom: 0 !important; border-bottom: none !important; }
                        #pdf-export-content h3 { font-size: 14pt !important; font-weight: bold !important; margin: 12pt 0 6pt !important; }
                        #pdf-export-content h4 { font-size: 12pt !important; font-weight: bold !important; margin: 10pt 0 4pt !important; }
                        #pdf-export-content h5, #pdf-export-content h6 { font-size: 11pt !important; font-weight: bold !important; margin: 8pt 0 4pt !important; }
                        #pdf-export-content p { margin: 0 0 10pt !important; text-align: justify !important; }
                        #pdf-export-content ul, #pdf-export-content ol { margin: 0 0 10pt !important; padding-left: 20pt !important; }
                        #pdf-export-content li { margin: 4pt 0 !important; }
                        #pdf-export-content blockquote { margin: 10pt 0 !important; padding: 8pt 12pt !important; border-left: 3pt solid #666 !important; background: #f5f5f5 !important; font-style: italic !important; }
                        #pdf-export-content pre { margin: 10pt 0 !important; padding: 10pt !important; background: #f5f5f5 !important; border: 1pt solid #ddd !important; border-radius: 4pt !important; font-family: 'Courier New', monospace !important; font-size: 10pt !important; white-space: pre-wrap !important; word-break: break-word !important; overflow-wrap: break-word !important; }
                        #pdf-export-content code { font-family: 'Courier New', monospace !important; font-size: 10pt !important; background: #f0f0f0 !important; padding: 1pt 3pt !important; border-radius: 2pt !important; }
                        #pdf-export-content pre code { background: transparent !important; padding: 0 !important; }
                        #pdf-export-content table { width: 100% !important; border-collapse: collapse !important; margin: 10pt 0 !important; font-size: 10pt !important; }
                        #pdf-export-content th, #pdf-export-content td { border: 1pt solid #333 !important; padding: 6pt 8pt !important; text-align: left !important; color: #000 !important; }
                        #pdf-export-content th { background: #f0f0f0 !important; font-weight: bold !important; }
                        #pdf-export-content hr { border: none !important; border-top: 1pt solid #333 !important; margin: 16pt 0 !important; }
                        #pdf-export-content a { color: #0066cc !important; text-decoration: none !important; }
                        #pdf-export-content img { max-width: 100% !important; height: auto !important; }
                    </style>
                    ${htmlBody}
                `;

				setInnerHTML(pdfWrapper, styledHtml);
				container.appendChild(pdfWrapper);
				document.body.appendChild(container);

				// Add pdf-export class
				document.body.classList.add('pdf-export');

				// Wait for content to fully render
				await new Promise((resolve) => setTimeout(resolve, 500));

				const opt = {
					margin: 0,
					filename: `${filename}.pdf`,
					image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
					html2canvas: {
						scale: 2,
						useCORS: true,
						logging: false,
						backgroundColor: '#ffffff',
						windowWidth: 794 // A4 width in pixels at 96dpi
					},
					jsPDF: {
						unit: 'mm' as 'mm',
						format: 'a4' as 'a4',
						orientation: 'portrait' as 'portrait'
					},
					pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
				};

				await html2pdf().set(opt).from(pdfWrapper).save();

				// Cleanup
				document.body.classList.remove('pdf-export');
				document.body.removeChild(container);
			} catch (e) {
				document.body.classList.remove('pdf-export');
				const containers = document.querySelectorAll('#pdf-export-content');
				containers.forEach((c) => c.parentElement?.remove());
				console.error('PDF Export failed', e);
				alert('Failed to generate PDF. See console for details.');
			}
		}
	}
</script>

<div
	class="relative z-30 flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2 transition-colors"
>
	<div class="mr-1 flex items-center gap-0.5 border-r border-slate-200 pr-1 dark:border-slate-700">
		<button
			class={btnClass}
			onclick={() => insertText('**', '**')}
			title="Bold (Ctrl+B)"
			disabled={!isEditorReady}><Bold size={18} /></button
		>
		<button
			class={btnClass}
			onclick={() => insertText('*', '*')}
			title="Italic (Ctrl+I)"
			disabled={!isEditorReady}><Italic size={18} /></button
		>
		<div class="dropdown group relative">
			<button class={btnClass} title="Headings" disabled={!isEditorReady}
				><Heading1 size={18} /><span class="absolute right-0 bottom-0 text-[10px]">▼</span></button
			>
			<div
				class="absolute top-full left-0 z-50 hidden min-w-[80px] rounded border border-slate-200 bg-white p-1 shadow-lg group-hover:block"
			>
				<button
					class="block w-full rounded px-2 py-1 text-left text-sm text-slate-900 hover:bg-slate-100"
					onclick={() => insertBlock('# ')}>H1</button
				>
				<button
					class="block w-full rounded px-2 py-1 text-left text-sm text-slate-900 hover:bg-slate-100"
					onclick={() => insertBlock('## ')}>H2</button
				>
				<button
					class="block w-full rounded px-2 py-1 text-left text-sm text-slate-900 hover:bg-slate-100"
					onclick={() => insertBlock('### ')}>H3</button
				>
			</div>
		</div>
	</div>
	<div class="mr-1 flex items-center gap-0.5 border-r border-slate-200 pr-1">
		<button class={btnClass} onclick={openLinkModal} title="Link (Ctrl+K)" disabled={!isEditorReady}
			><Link size={18} /></button
		>
		<button class={btnClass} onclick={openImageModal} title="Image" disabled={!isEditorReady}
			><Image size={18} /></button
		>
		<button
			class={btnClass}
			onclick={() => insertBlock('> ')}
			title="Quote"
			disabled={!isEditorReady}><Quote size={18} /></button
		>
	</div>
	<div class="mr-1 flex items-center gap-0.5 border-r border-slate-200 pr-1">
		<button
			class={btnClass}
			onclick={() => insertBlock('- ')}
			title="Unordered List"
			disabled={!isEditorReady}><List size={18} /></button
		>
		<button
			class={btnClass}
			onclick={() => insertBlock('1. ')}
			title="Ordered List"
			disabled={!isEditorReady}><span class="text-xs font-bold">1.</span></button
		>
		<button
			class={btnClass}
			onclick={() => insertText('```\n', '\n```')}
			title="Code Block"
			disabled={!isEditorReady}><Code size={18} /></button
		>
		<button class={btnClass} onclick={onOpenTableModal} title="Table" disabled={!isEditorReady}
			><Table size={18} /></button
		>
	</div>
	<div class="flex-1"></div>
	<div class="mr-2 flex items-center gap-0.5">
		<button class={btnClass} onclick={() => handleExport('md')} title="Download markdown"
			><FileText size={18} /></button
		>
		<button class={btnClass} onclick={() => handleExport('html')} title="Export HTML"
			><FileCode size={18} /></button
		>
		<button class={btnClass} onclick={() => handleExport('pdf')} title="Save as PDF"
			><FileDown size={18} /></button
		>
	</div>
	<div class="flex items-center gap-0.5 border-l border-slate-200 pl-1">
		<button
			class={btnClass}
			onclick={() => ($showCheatsheet = !$showCheatsheet)}
			title="Toggle Cheatsheet"><PanelLeft size={18} /></button
		>
		<button
			class={$showPreview ? `${btnClass} text-blue-600` : btnClass}
			onclick={() => ($showPreview = !$showPreview)}
			title={$showPreview ? 'Preview Only' : 'Show Editor'}><Columns2 size={18} /></button
		>
		<button class={btnClass} onclick={onToggleFullscreen} title="Toggle Fullscreen"
			>{#if isFullscreen}<Minimize size={18} />{:else}<Maximize size={18} />{/if}</button
		>
	</div>
</div>

<LinkModal bind:isOpen={showLinkModal} initialText={selectedText} onInsert={handleLinkInsert} />
<ImageModal bind:isOpen={showImageModal} onInsert={handleImageInsert} />
