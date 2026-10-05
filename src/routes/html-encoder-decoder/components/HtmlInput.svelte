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
	import type { OperationMode } from '../utils/htmlEncoder';

	interface Props {
		inputText: string;
		mode: OperationMode;
		autoDetect: boolean;
		onInputChange: (text: string) => void;
		onModeChange: (mode: OperationMode) => void;
		onAutoDetectChange: (enabled: boolean) => void;
		onSwap: () => void;
		onReset: () => void;
		onLoadSample: () => void;
	}

	let {
		inputText,
		mode,
		autoDetect,
		onInputChange,
		onModeChange,
		onAutoDetectChange,
		onSwap,
		onReset,
		onLoadSample
	}: Props = $props();
</script>

<Card class="h-full border-slate-200 shadow-sm dark:border-slate-800">
	<CardHeader class="pb-4">
		<CardTitle class="text-xl font-semibold tracking-tight">HTML Input</CardTitle>
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
					variant={mode === 'encode' ? 'default' : 'outline'}
					onclick={() => onModeChange('encode')}
					class="w-full transition-all"
				>
					Encode
				</Button>
				<Button
					variant={mode === 'decode' ? 'default' : 'outline'}
					onclick={() => onModeChange('decode')}
					class="w-full transition-all"
				>
					Decode
				</Button>
			</div>
		</div>

		<!-- Auto-detect Option -->
		<div
			class="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
		>
			<Label
				class="mb-3 block text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
			>
				Options
			</Label>
			<div class="flex items-center space-x-2">
				<Checkbox
					id="opt-autodetect"
					checked={autoDetect}
					onchange={() => onAutoDetectChange(!autoDetect)}
					ariaLabel="Auto-detect mode"
				/>
				<Label
					htmlFor="opt-autodetect"
					class="flex cursor-pointer items-center gap-1.5 text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Auto-detect mode
					<span class="text-muted-foreground text-xs">(based on input)</span>
				</Label>
			</div>
		</div>

		<!-- Input Area -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<Label htmlFor="html-text-input">{mode === 'encode' ? 'Plain Text' : 'HTML Entities'}</Label
				>
				<span class="text-xs text-slate-500 dark:text-slate-400">{inputText.length} characters</span
				>
			</div>
			<Textarea
				id="html-text-input"
				value={inputText}
				oninput={(e) => onInputChange((e.target as HTMLTextAreaElement).value)}
				placeholder={mode === 'encode'
					? 'Enter text to encode (e.g., <div class="test">Hello & World</div>)'
					: 'Enter HTML entities (e.g., &lt;div&gt;Hello &amp; World&lt;/div&gt;)'}
				class="min-h-[160px] font-mono text-sm leading-relaxed"
			/>
		</div>

		<!-- Actions -->
		<div class="grid grid-cols-3 gap-3">
			<Button variant="secondary" onclick={onLoadSample} class="w-full">Load Sample</Button>
			<Button variant="secondary" onclick={onSwap} class="w-full">
				<svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				onclick={onReset}
				class="w-full text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
			>
				Reset
			</Button>
		</div>
	</CardContent>
</Card>
