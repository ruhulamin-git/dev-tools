<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, Button } from '$lib/shared/components/ui';
	import type { OperationMode } from '../utils/htmlEncoder';

	interface Props {
		outputText: string;
		mode: OperationMode;
	}

	let { outputText, mode }: Props = $props();
	let copied = $state(false);

	const handleCopy = async () => {
		if (!outputText) return;
		try {
			await navigator.clipboard.writeText(outputText);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {}
	};
</script>

{#if outputText}
	<Card class="h-full border-slate-200 shadow-sm dark:border-slate-800">
		<CardHeader class="pb-4">
			<div class="flex items-center justify-between">
				<div>
					<CardTitle class="text-xl font-semibold tracking-tight"
						>{mode === 'encode' ? 'HTML Entities' : 'Plain Text'}</CardTitle
					>
					<p class="text-sm text-slate-500 dark:text-slate-400">{outputText.length} characters</p>
				</div>
				<Button variant="secondary" onclick={handleCopy} class="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class={copied ? 'text-green-600' : ''}
					>
						{#if copied}
							<polyline points="20 6 9 17 4 12" />
						{:else}
							<rect width="14" height="14" x="8" y="8" rx="2" />
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						{/if}
					</svg>
					{copied ? 'Copied!' : 'Copy'}
				</Button>
			</div>
		</CardHeader>
		<CardContent>
			<div class="overflow-hidden rounded-lg bg-slate-900 shadow-inner">
				<pre
					class="max-h-[300px] overflow-auto p-4 font-mono text-sm break-all whitespace-pre-wrap text-slate-100"><code
						>{outputText}</code
					></pre>
			</div>
		</CardContent>
	</Card>
{/if}
