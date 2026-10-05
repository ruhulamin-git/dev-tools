<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Label,
		Button,
		Textarea,
		Checkbox
	} from '$lib/shared/components/ui';
	import type { InputMode, OperationMode, Base64Options } from '../utils/base64Encoder';
	import { formatFileSize } from '../utils/base64Encoder';

	interface Props {
		inputMode: InputMode;
		operationMode: OperationMode;
		options: Base64Options;
		textInput: string;
		selectedFile: File | null;
		autoDetected: boolean;
		onTextChange: (text: string) => void;
		onFileSelect: (file: File) => void;
		onInputModeChange: (mode: InputMode) => void;
		onOperationModeChange: (mode: OperationMode) => void;
		onOptionsChange: (options: Base64Options) => void;
		onReset: () => void;
		sampleText: string;
		onLoadSample: () => void;
	}

	let {
		inputMode,
		operationMode,
		options,
		textInput,
		selectedFile,
		autoDetected,
		onTextChange,
		onFileSelect,
		onInputModeChange,
		onOperationModeChange,
		onOptionsChange,
		onReset,
		sampleText,
		onLoadSample
	}: Props = $props();

	let isDragging = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	const inputModes: { value: InputMode; label: string }[] = [
		{ value: 'text', label: 'Text' },
		{ value: 'file', label: 'File' },
		{ value: 'image', label: 'Image' }
	];

	function toggleUrlSafe() {
		onOptionsChange({ ...options, urlSafe: !options.urlSafe });
	}

	function toggleRemovePadding() {
		onOptionsChange({ ...options, removePadding: !options.removePadding });
	}
</script>

<Card class="h-full border-slate-200 shadow-sm dark:border-slate-800">
	<CardHeader class="pb-4">
		<CardTitle class="text-xl font-semibold tracking-tight">Base64 Input</CardTitle>
		<CardDescription class="text-sm text-slate-500 dark:text-slate-400">
			Configure mode and enter your data
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- Operation Mode -->
		<div class="space-y-2">
			<Label>Operation Mode</Label>
			<div class="flex gap-2">
				<Button
					variant={operationMode === 'encode' ? 'default' : 'outline'}
					onclick={() => onOperationModeChange('encode')}
					class="w-full transition-all"
				>
					Encode
				</Button>
				<Button
					variant={operationMode === 'decode' ? 'default' : 'outline'}
					onclick={() => onOperationModeChange('decode')}
					class="w-full transition-all"
				>
					Decode
				</Button>
			</div>
			{#if autoDetected}
				<p class="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
					<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
							clip-rule="evenodd"
						/>
					</svg>
					Auto-detected as Base64 input
				</p>
			{/if}
		</div>

		<!-- Input Source -->
		<div class="space-y-2">
			<Label>Input Source</Label>
			<div class="flex gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
				{#each inputModes as mode}
					<Button
						variant={inputMode === mode.value ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => onInputModeChange(mode.value)}
						class="flex-1 transition-all {inputMode === mode.value
							? 'bg-slate-100 shadow-sm dark:bg-slate-800'
							: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}"
					>
						{mode.label}
					</Button>
				{/each}
			</div>
		</div>

		<!-- Options (Config) -->
		<div
			class="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
		>
			<Label
				class="mb-3 block text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
			>
				Encoding Options
			</Label>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex items-center space-x-2">
					<Checkbox
						id="opt-urlsafe"
						checked={options.urlSafe}
						onchange={toggleUrlSafe}
						ariaLabel="URL-safe Base64"
					/>
					<Label
						htmlFor="opt-urlsafe"
						class="flex cursor-pointer items-center gap-1.5 text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						URL-safe Base64
						<span class="text-muted-foreground text-xs">(-_)</span>
					</Label>
				</div>
				<div class="flex items-center space-x-2 {options.urlSafe ? '' : 'opacity-50'}">
					<Checkbox
						id="opt-padding"
						checked={options.removePadding}
						onchange={toggleRemovePadding}
						disabled={!options.urlSafe}
						ariaLabel="Remove Padding"
					/>
					<Label
						htmlFor="opt-padding"
						class="flex cursor-pointer items-center gap-1.5 text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Remove padding
						<span class="text-muted-foreground text-xs">(=)</span>
					</Label>
				</div>
			</div>
		</div>

		<!-- Input Area -->
		<div class="space-y-2">
			{#if inputMode === 'text'}
				<Label htmlFor="base64-text-input" class="sr-only">Text Input</Label>
				<Textarea
					id="base64-text-input"
					value={textInput}
					oninput={(e) => onTextChange((e.target as HTMLTextAreaElement).value)}
					placeholder={operationMode === 'encode'
						? 'Enter text to encode...'
						: 'Paste Base64 string here...'}
					class="min-h-[160px] font-mono text-sm leading-relaxed"
				/>
			{:else}
				<div
					role="button"
					tabindex="0"
					class="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-all hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-600 dark:hover:bg-slate-900 {isDragging
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						: ''}"
					ondragover={(e) => {
						e.preventDefault();
						isDragging = true;
					}}
					ondragleave={(e) => {
						e.preventDefault();
						isDragging = false;
					}}
					ondrop={(e) => {
						e.preventDefault();
						isDragging = false;
						if (e.dataTransfer?.files[0]) onFileSelect(e.dataTransfer.files[0]);
					}}
					onclick={() => fileInput?.click()}
					onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
				>
					<input
						bind:this={fileInput}
						type="file"
						accept={inputMode === 'image' ? 'image/*' : '*/*'}
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							if (target.files?.[0]) onFileSelect(target.files[0]);
						}}
						class="hidden"
					/>
					{#if selectedFile}
						<div class="space-y-2">
							<div
								class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50"
							>
								<svg
									class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/></svg
								>
							</div>
							<div class="space-y-1">
								<p class="text-sm font-medium">{selectedFile.name}</p>
								<p class="text-muted-foreground text-xs">{formatFileSize(selectedFile.size)}</p>
							</div>
						</div>
					{:else}
						<div class="space-y-2">
							<div
								class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
							>
								<svg
									class="h-6 w-6 text-slate-500 dark:text-slate-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/></svg
								>
							</div>
							<div class="space-y-1">
								<p class="text-sm font-medium text-slate-700 dark:text-slate-300">
									{inputMode === 'image'
										? 'Drop image here or click to upload'
										: 'Drop file here or click to upload'}
								</p>
								<p class="text-xs text-slate-600 dark:text-slate-400">
									{inputMode === 'image' ? 'PNG, JPG, GIF, WebP' : 'Any file type supported'}
								</p>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="grid grid-cols-2 gap-3">
			<Button variant="secondary" onclick={onLoadSample} class="w-full">Load Sample</Button>
			<Button
				variant="ghost"
				onclick={onReset}
				class="w-full text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
			>
				Reset
			</Button>
		</div>
	</CardContent>
</Card>
