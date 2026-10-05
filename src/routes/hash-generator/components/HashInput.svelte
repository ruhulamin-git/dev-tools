<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Label,
		Textarea,
		Input,
		Switch,
		Button
	} from '$lib/shared/components/ui';
	import type { InputType } from '../types';

	let {
		inputType = $bindable(),
		textInput = $bindable(),
		fileInput = $bindable(),
		secretKey = $bindable(),
		isUpperCase = $bindable(),
		textTabDisabled = false,
		fileTabDisabled = false,
		activeSource = null,
		onGenerate,
		onFileSelect,
		onDrop,
		onDragOver,
		onReset,
		onTabChange
	} = $props<{
		inputType: InputType;
		textInput: string;
		fileInput: File | null;
		secretKey: string;
		isUpperCase: boolean;
		textTabDisabled?: boolean;
		fileTabDisabled?: boolean;
		activeSource?: 'text' | 'file' | null;
		onGenerate: () => void;
		onFileSelect: (e: Event) => void;
		onDrop: (e: DragEvent) => void;
		onDragOver: (e: DragEvent) => void;
		onReset: () => void;
		onTabChange: (tab: 'text' | 'file') => void;
	}>();
</script>

<Card class="h-full border-slate-200 shadow-lg dark:border-slate-800">
	<CardHeader>
		<div class="flex items-center justify-between">
			<div>
				<CardTitle>Input</CardTitle>
				<CardDescription>Enter text or upload a file to hash.</CardDescription>
			</div>
			<Button
				variant="ghost"
				size="sm"
				class="gap-1.5 text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
				onclick={onReset}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg
				>
				Reset
			</Button>
		</div>
	</CardHeader>
	<CardContent class="space-y-6">
		<!-- Input Source -->
		<div class="space-y-2">
			<Label>Input Source</Label>
			<div class="flex gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
				<div class="group relative flex-1">
					<Button
						variant={inputType === 'text' ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => !textTabDisabled && onTabChange('text')}
						class="w-full transition-all {inputType === 'text'
							? 'bg-slate-100 shadow-sm dark:bg-slate-800'
							: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'} {textTabDisabled
							? 'cursor-not-allowed opacity-50'
							: ''}"
					>
						Text
					</Button>
					{#if textTabDisabled}
						<div
							class="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform rounded-lg bg-slate-800 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
						>
							Click Reset to activate text input
							<div
								class="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-800"
							></div>
						</div>
					{/if}
				</div>
				<div class="group relative flex-1">
					<Button
						variant={inputType === 'file' ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => !fileTabDisabled && onTabChange('file')}
						class="w-full transition-all {inputType === 'file'
							? 'bg-slate-100 shadow-sm dark:bg-slate-800'
							: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'} {fileTabDisabled
							? 'cursor-not-allowed opacity-50'
							: ''}"
					>
						File
					</Button>
					{#if fileTabDisabled}
						<div
							class="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform rounded-lg bg-slate-800 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
						>
							Click Reset to activate file input
							<div
								class="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-800"
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Input Area -->
		<div class="space-y-2">
			{#if inputType === 'text'}
				<Label htmlFor="text-input">Text to Hash</Label>
				<Textarea
					id="text-input"
					bind:value={textInput}
					placeholder="Type something..."
					class="min-h-[150px] resize-none"
					disabled={textTabDisabled}
				/>
			{:else}
				<div
					class="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-all hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-600 dark:hover:bg-slate-900 {fileTabDisabled
						? 'pointer-events-none opacity-50'
						: ''}"
					role="button"
					tabindex={fileTabDisabled ? -1 : 0}
					onkeydown={(e) =>
						!fileTabDisabled &&
						e.key === 'Enter' &&
						document.getElementById('file-upload')?.click()}
					onclick={() => !fileTabDisabled && document.getElementById('file-upload')?.click()}
					ondrop={(e) => {
						if (fileTabDisabled) return;
						e.preventDefault();
						e.stopPropagation();
						onDrop(e);
					}}
					ondragover={(e) => {
						if (fileTabDisabled) return;
						e.preventDefault();
						e.stopPropagation();
					}}
					ondragenter={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<span class="mb-4 text-4xl text-slate-400">📄</span>
					<div class="text-center">
						<p class="text-sm font-medium text-slate-700 dark:text-slate-300">
							{fileInput ? fileInput.name : 'Click to upload or drag and drop'}
						</p>
						{#if fileInput}
							<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
								{(fileInput.size / 1024).toFixed(2)} KB
							</p>
						{/if}
					</div>
					<input
						id="file-upload"
						type="file"
						class="hidden"
						onchange={onFileSelect}
						disabled={fileTabDisabled}
					/>
				</div>
			{/if}
		</div>

		<div class="space-y-2">
			<Label class="flex items-center gap-2" htmlFor="secret-key">
				Secret Key (HMAC)
				<span
					class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
					>Optional</span
				>
			</Label>
			<Input
				id="secret-key"
				type="password"
				bind:value={secretKey}
				placeholder="Enter secret key..."
				oninput={onGenerate}
			/>
		</div>

		<div
			class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800"
		>
			<Label class="cursor-pointer" htmlFor="uppercase-toggle">Uppercase Output</Label>
			<Switch
				id="uppercase-toggle"
				bind:checked={isUpperCase}
				ariaLabel="Toggle uppercase output"
			/>
		</div>
	</CardContent>
</Card>
