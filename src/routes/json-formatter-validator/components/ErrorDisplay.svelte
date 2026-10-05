<script lang="ts">
	interface Props {
		error: {
			message: string;
			line?: number;
			column?: number;
		} | null;
	}

	let { error }: Props = $props();
</script>

{#if error}
	<div
		class="mt-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-sm dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/30"
	>
		<div class="flex items-start gap-4">
			<div
				class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
			>
				<svg
					class="h-5 w-5 text-red-600 dark:text-red-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div class="flex-1">
				<h4 class="font-semibold text-red-800 dark:text-red-300">Invalid JSON Syntax</h4>
				<p class="mt-1 text-sm text-red-700 dark:text-red-400">{error.message}</p>
				{#if error.line}
					<div
						class="mt-2 inline-flex items-center gap-2 rounded-md bg-red-100 px-2 py-1 dark:bg-red-900/40"
					>
						<svg
							class="h-3.5 w-3.5 text-red-600 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<span class="text-xs font-medium text-red-700 dark:text-red-300">
							Line {error.line}{error.column ? `, Column ${error.column}` : ''}
						</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
