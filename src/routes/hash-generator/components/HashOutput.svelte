<script lang="ts">
	import { slide } from 'svelte/transition';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Button,
		Label,
		Input,
		Progress
	} from '$lib/shared/components/ui';
	import type { HashResult } from '../types';

	let {
		results,
		algorithms,
		compareHash = $bindable(),
		isLoading,
		progress,
		copied,
		onCopy,
		formatHash,
		getComparisonStatus
	} = $props<{
		results: Record<string, HashResult>;
		algorithms: string[];
		compareHash: string;
		isLoading: boolean;
		progress: number;
		copied: string | null;
		onCopy: (text: string, algo: string) => void;
		formatHash: (hash: string) => string;
		getComparisonStatus: (hash: string) => 'match' | 'mismatch' | null;
	}>();
</script>

<Card class="h-full border-slate-200 shadow-lg dark:border-slate-800">
	<CardHeader class="flex flex-row items-center justify-between pb-2">
		<div>
			<CardTitle>Generated Hashes</CardTitle>
			<CardDescription>Real-time hash generation.</CardDescription>
		</div>
		{#if isLoading}
			<div class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
				<span class="animate-spin">↻</span>
				Processing...
			</div>
		{/if}
	</CardHeader>
	<CardContent class="space-y-6">
		{#if isLoading}
			<Progress value={progress} class="h-1" />
		{/if}

		<div class="space-y-4">
			{#each algorithms as algo}
				<div
					class="group relative rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700"
				>
					<div class="mb-2 flex items-center justify-between">
						<span class="font-semibold text-slate-700 dark:text-slate-200">{algo}</span>
						<div class="flex items-center gap-2">
							{#if results[algo].loading}
								<div class="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-700"></div>
							{:else if results[algo].hash}
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
									onclick={() => onCopy(results[algo].hash, algo)}
								>
									{#if copied === algo}
										<span class="text-green-500">✓</span>
									{:else}
										<span>📋</span>
									{/if}
									<span class="sr-only">Copy {algo}</span>
								</Button>
							{/if}
						</div>
					</div>

					<div class="relative">
						{#if results[algo].loading}
							<div class="h-10 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-700"></div>
						{:else if results[algo].error}
							<div
								class="flex items-center gap-2 rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
							>
								<span>⚠️</span>
								{results[algo].error}
							</div>
						{:else if results[algo].hash}
							<div
								class="rounded bg-slate-50 p-3 font-mono text-sm break-all text-slate-600 dark:bg-slate-900 dark:text-slate-300"
							>
								{formatHash(results[algo].hash)}
							</div>

							{#if compareHash}
								{@const status = getComparisonStatus(results[algo].hash)}
								{#if status}
									<div
										class="mt-2 flex items-center gap-2 text-xs font-medium"
										class:text-green-600={status === 'match'}
										class:text-red-600={status === 'mismatch'}
										transition:slide
									>
										{#if status === 'match'}
											<span>✓</span> Match
										{:else}
											<span>⚠️</span> Mismatch
										{/if}
									</div>
								{/if}
							{/if}
						{:else}
							<div class="text-sm text-slate-500 italic dark:text-slate-400">
								Waiting for input...
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
			<Label htmlFor="compare-input" class="block">Compare with Hash</Label>
			<div class="relative">
				<Input
					id="compare-input"
					bind:value={compareHash}
					placeholder="Paste a hash to compare..."
					class="mt-3 pr-10"
				/>
				{#if compareHash}
					<div class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">
						<span>🛡️</span>
					</div>
				{/if}
			</div>
		</div>
	</CardContent>
</Card>
