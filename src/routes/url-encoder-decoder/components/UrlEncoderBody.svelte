<script lang="ts">
	import {
		Button,
		Textarea,
		Label,
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		Switch
	} from '$lib/shared/components/ui';
	import { CopyButton } from '$lib/shared/components';
	import { encodeUrl, decodeUrl, hasEncodedCharacters } from '../utils/urlEncoder';

	interface Props {
		onJsonDetected?: (hasJson: boolean) => void;
	}

	let { onJsonDetected }: Props = $props();

	let inputText = $state('');
	let outputText = $state('');
	let mode = $state<'encode' | 'decode'>('encode');
	let autoDetect = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Detect if decoded output contains JSON-like data
	function detectJsonInOutput(text: string): boolean {
		if (!text || mode !== 'decode') return false;
		
		// Check if the decoded text contains JSON-like patterns
		// Common in query parameters like ?data={"key":"value"}
		const jsonPatterns = [
			/\{[^}]*"[^"]+"\s*:\s*[^}]+\}/,  // {"key": "value"}
			/\[[^\]]*\{[^}]*"[^"]+"/,         // [{"key": ...
			/%7B.*%22.*%22.*%7D/i              // Still encoded JSON
		];
		
		return jsonPatterns.some(pattern => pattern.test(text));
	}

	$effect(() => {
		if (!inputText.trim()) {
			outputText = '';
			if (onJsonDetected) onJsonDetected(false);
			return;
		}

		if (autoDetect) {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const shouldDecode = hasEncodedCharacters(inputText);
				if (shouldDecode && mode !== 'decode') {
					mode = 'decode';
				} else if (!shouldDecode && mode !== 'encode') {
					mode = 'encode';
				}
			}, 300);
		}

		if (mode === 'encode') {
			outputText = encodeUrl(inputText);
		} else {
			outputText = decodeUrl(inputText);
		}

		// Notify parent if JSON is detected in decoded output
		if (onJsonDetected) {
			onJsonDetected(detectJsonInOutput(outputText));
		}
	});

	function handleReset() {
		inputText = '';
		outputText = '';
		mode = 'encode';
	}

	function handleSwap() {
		const temp = inputText;
		inputText = outputText;
		outputText = temp;
		mode = mode === 'encode' ? 'decode' : 'encode';
	}

	function setMode(newMode: 'encode' | 'decode') {
		mode = newMode;
		autoDetect = false;
	}
</script>

<div class="space-y-6">
	<!-- Control Bar -->
	<Card class="border-slate-200 shadow-lg dark:border-slate-800">
		<CardContent class="p-4 sm:p-6">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<!-- Mode Selection -->
				<div class="flex items-center gap-4">
					<div class="flex gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
						<Button
							variant={mode === 'encode' ? 'secondary' : 'ghost'}
							size="sm"
							onclick={() => setMode('encode')}
							class="transition-all {mode === 'encode'
								? 'bg-slate-100 shadow-sm dark:bg-slate-800'
								: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}"
						>
							Encode
						</Button>
						<Button
							variant={mode === 'decode' ? 'secondary' : 'ghost'}
							size="sm"
							onclick={() => setMode('decode')}
							class="transition-all {mode === 'decode'
								? 'bg-slate-100 shadow-sm dark:bg-slate-800'
								: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}"
						>
							Decode
						</Button>
					</div>

					<div class="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800"></div>

					<div class="flex items-center gap-2">
						<Switch id="auto-detect" bind:checked={autoDetect} />
						<Label htmlFor="auto-detect" class="cursor-pointer">Auto-detect</Label>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex w-full items-center gap-2 text-slate-700 sm:w-auto dark:text-slate-200">
					<Button
						variant="outline"
						size="sm"
						onclick={handleSwap}
						disabled={!outputText}
						class="flex-1 border-slate-200 sm:flex-none dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
							/>
						</svg>
						Swap
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="flex-1 gap-1.5 text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 sm:flex-none dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
						onclick={handleReset}
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
							><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path
								d="M3 3v5h5"
							/></svg
						>
						Reset
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Conversion Area -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Input Section -->
		<Card class="h-full border-slate-200 shadow-lg dark:border-slate-800">
			<CardHeader>
				<div class="flex items-center justify-between">
					<CardTitle>{mode === 'encode' ? 'Plain Text' : 'Encoded URL'}</CardTitle>
					<span class="text-xs text-slate-500 dark:text-slate-400">
						{inputText.length} characters
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<Textarea
					bind:value={inputText}
					placeholder={mode === 'encode'
						? 'Enter text to encode (e.g., Hello World! 你好)'
						: 'Enter URL-encoded text (e.g., Hello%20World%21)'}
					class="min-h-[300px] resize-none font-mono text-sm text-slate-900 dark:text-slate-100"
				/>
			</CardContent>
		</Card>

		<!-- Output Section -->
		<Card
			class="h-full border-slate-200 bg-slate-50 shadow-lg dark:border-slate-800 dark:bg-slate-900/50"
		>
			<CardHeader>
				<div class="flex items-center justify-between">
					<CardTitle>{mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}</CardTitle>
					<div class="flex items-center gap-3">
						<span class="text-xs text-slate-500 dark:text-slate-400">
							{outputText.length} characters
						</span>
						{#if outputText}
							<CopyButton
								text={outputText}
								label=""
								variant="ghost"
								class="h-8 w-8 p-0"
								successMessage="Copied!"
							/>
						{/if}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Textarea
					value={outputText}
					readonly
					placeholder="Output will appear here..."
					class="min-h-[300px] resize-none border-none bg-transparent p-0 font-mono text-sm text-slate-900 shadow-none focus-visible:ring-0 dark:text-slate-100"
				/>
			</CardContent>
		</Card>
	</div>
</div>
