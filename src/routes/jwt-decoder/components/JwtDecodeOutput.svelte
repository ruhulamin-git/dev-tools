<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, Button } from '$lib/shared/components/ui';
	import type { DecodedJWT, JWTValidation } from '../utils/jwtValidator';
	import { formatJSON } from '../utils/jwtValidator';

	interface Props {
		decoded: DecodedJWT | null;
		validation: JWTValidation | null;
		timeRemaining: string;
	}
	let { decoded, validation, timeRemaining }: Props = $props();
	let copiedStates = $state({ header: false, payload: false, signature: false });

	const handleCopy = async (content: string, type: 'header' | 'payload' | 'signature') => {
		try {
			await navigator.clipboard.writeText(content);
			copiedStates[type] = true;
			setTimeout(() => {
				copiedStates[type] = false;
			}, 2000);
		} catch {}
	};
</script>

{#if validation}
	<Card
		class="mb-6 border-slate-200 shadow-lg dark:border-slate-800 {validation.isExpired
			? 'border-l-4 border-l-red-500'
			: 'border-l-4 border-l-green-500'}"
	>
		<CardHeader class="pb-2">
			<div class="flex items-start gap-4">
				<div
					class="rounded-full p-2 {validation.isExpired
						? 'bg-red-100 text-red-600 dark:bg-red-900/50'
						: 'bg-green-100 text-green-600 dark:bg-green-900/50'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						{#if validation.isExpired}<path
								d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
							/><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
						{:else}<polyline points="20 6 9 17 4 12" />{/if}
					</svg>
				</div>
				<div class="flex-1">
					<CardTitle
						class={validation.isExpired
							? 'text-red-700 dark:text-red-400'
							: 'text-green-700 dark:text-green-400'}
					>
						{validation.isExpired ? 'Token Expired' : 'Token Valid'}
					</CardTitle>
					<p class="text-sm text-slate-600 dark:text-slate-400">{validation.message}</p>
				</div>
			</div>
		</CardHeader>
		{#if validation.expiresAt}
			<CardContent class="space-y-2 pt-0">
				<div class="flex justify-between text-sm">
					<span class="text-slate-600 dark:text-slate-400">Expires At:</span>
					<span class="font-mono text-slate-900 dark:text-slate-100"
						>{validation.expiresAt.toLocaleString()}</span
					>
				</div>
				{#if timeRemaining && !validation.isExpired}
					<div class="flex justify-between text-sm">
						<span class="text-slate-600 dark:text-slate-400">Time Remaining:</span>
						<span
							class="rounded-full bg-green-100 px-3 py-1 font-mono text-xs text-green-700 dark:bg-green-900/50 dark:text-green-400"
							>{timeRemaining}</span
						>
					</div>
				{/if}
			</CardContent>
		{/if}
	</Card>
{/if}

{#if decoded}
	<Card class="border-slate-200 shadow-lg dark:border-slate-800">
		<CardHeader>
			<CardTitle>Decoded Token</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Header -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold text-blue-600 dark:text-blue-400">HEADER</h3>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
						onclick={() => handleCopy(formatJSON(decoded.header), 'header')}
						aria-label="Copy Header"
						title="Copy Header"
					>
						{#if copiedStates.header}
							<span class="text-xs text-green-500">✓</span>
						{:else}
							<span class="text-xs">📋</span>
						{/if}
					</Button>
				</div>
				<div
					class="rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-sm break-all text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
				>
					<pre class="whitespace-pre-wrap"><code>{formatJSON(decoded.header)}</code></pre>
				</div>
			</div>

			<div class="h-px bg-slate-100 dark:bg-slate-800"></div>

			<!-- Payload -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold text-purple-600 dark:text-purple-400">PAYLOAD</h3>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
						onclick={() => handleCopy(formatJSON(decoded.payload), 'payload')}
						aria-label="Copy Payload"
						title="Copy Payload"
					>
						{#if copiedStates.payload}
							<span class="text-xs text-green-500">✓</span>
						{:else}
							<span class="text-xs">📋</span>
						{/if}
					</Button>
				</div>
				<div
					class="rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-sm break-all text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
				>
					<pre class="whitespace-pre-wrap"><code>{formatJSON(decoded.payload)}</code></pre>
				</div>
			</div>

			<div class="h-px bg-slate-100 dark:bg-slate-800"></div>

			<!-- Signature -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">SIGNATURE</h3>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
						onclick={() => handleCopy(decoded.signature, 'signature')}
						aria-label="Copy Signature"
						title="Copy Signature"
					>
						{#if copiedStates.signature}
							<span class="text-xs text-green-500">✓</span>
						{:else}
							<span class="text-xs">📋</span>
						{/if}
					</Button>
				</div>
				<div
					class="rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-sm break-all text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
				>
					<pre class="whitespace-pre-wrap"><code>{decoded.signature}</code></pre>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}
