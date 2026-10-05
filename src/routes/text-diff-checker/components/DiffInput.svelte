<script lang="ts">
	interface Props {
		id: string;
		label: string;
		placeholder: string;
		value: string;
		fileName: string;
		variant: 'original' | 'modified';
		onValueChange: (value: string) => void;
		onFileChange: (fileName: string) => void;
	}

	let { id, label, placeholder, value, fileName, variant, onValueChange, onFileChange }: Props =
		$props();

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);

	const supportedExtensions =
		'.txt,.md,.json,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs,.yaml,.yml,.toml,.ini,.cfg,.log,.csv,.sql,.sh,.bash,.zsh,.php,.rb,.swift,.kt,.scala,.r,.m,.h,.hpp';

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		processFile(file);
	}

	function processFile(file: File | undefined) {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				onValueChange(content);
				onFileChange(file.name);
			};
			reader.readAsText(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files[0];
		processFile(file);
	}

	function clearInput() {
		onValueChange('');
		onFileChange('');
	}

	let isOriginal = $derived(variant === 'original');
	let lineCount = $derived(value ? value.split('\n').length : 0);
</script>

<div class="flex h-full flex-col gap-3">
	<!-- Header -->
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<label for={id} class="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-100">
			<span
				class="flex h-6 w-6 items-center justify-center rounded-md {isOriginal
					? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
					: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}"
			>
				{#if isOriginal}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				{/if}
			</span>
			<span>{label}</span>
			{#if fileName}
				<span
					class="rounded-full px-2.5 py-0.5 text-xs font-medium {isOriginal
						? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
						: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}"
				>
					{fileName}
				</span>
			{/if}
		</label>

		<div class="flex flex-wrap items-center gap-2">
			{#if value}
				<span class="text-xs text-slate-400 whitespace-nowrap">{lineCount} lines</span>
				<button
					type="button"
					onclick={clearInput}
					class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
					aria-label="Clear input"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
			<button
				type="button"
				onclick={() => fileInput.click()}
				class="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
				aria-label="Upload file"
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
					/>
				</svg>
				<span class="hidden sm:inline">Upload</span>
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept={supportedExtensions}
				onchange={handleFileUpload}
				class="hidden"
			/>
		</div>
	</div>

	<!-- Textarea with drag-drop -->
	<div
		class="relative flex-1 rounded-md bg-white dark:bg-slate-900"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		role="region"
	>
		<textarea
			{id}
			{value}
			oninput={(e) => onValueChange((e.target as HTMLTextAreaElement).value)}
			class="custom-scrollbar relative z-1 h-full min-h-64 sm:min-h-80 w-full resize-none rounded-md border bg-transparent px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500 {isDragging
				? isOriginal
					? 'border-red-400 bg-red-50/50 dark:border-red-500 dark:bg-red-950/30'
					: 'border-green-400 bg-green-50/50 dark:border-green-500 dark:bg-green-950/30'
				: value.trim()
					? 'border-slate-200 hover:border-slate-300 focus-visible:ring-2! focus-visible:ring-blue-500! focus-visible:ring-offset-2! focus-visible:ring-offset-white! focus-visible:outline-none! dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
					: 'border-slate-200 hover:border-slate-300 focus-visible:ring-2! focus-visible:ring-blue-500! focus-visible:ring-offset-2! focus-visible:ring-offset-white! focus-visible:outline-none! dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600'}"
			{placeholder}
		></textarea>

		<!-- Drag overlay -->
		{#if isDragging}
			<div
				class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed {isOriginal
					? 'border-red-400 bg-red-50/80 dark:border-red-500 dark:bg-red-950/60'
					: 'border-green-400 bg-green-50/80 dark:border-green-500 dark:bg-green-950/60'}"
			>
				<div class="flex flex-col items-center gap-2">
					<svg
						class="h-10 w-10 {isOriginal
							? 'text-red-400 dark:text-red-500'
							: 'text-green-400 dark:text-green-500'}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					<span
						class="text-sm font-medium {isOriginal
							? 'text-red-600 dark:text-red-400'
							: 'text-green-600 dark:text-green-400'}"
					>
						Drop file here
					</span>
				</div>
			</div>
		{/if}

		<!-- Empty state hint - only show when truly empty -->
		{#if !value.trim() && !isDragging}
			<div
				class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center rounded-md"
			>
				<div class="flex flex-col items-center gap-3 text-center">
					<div class="rounded-full bg-slate-100 p-4 dark:bg-slate-700">
						<svg
							class="h-8 w-8 text-slate-400 dark:text-slate-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-500 dark:text-slate-400">
							Paste text or drag a file
						</p>
						<p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
							.txt, .md, .json, .xml, .js, .py, and more
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
