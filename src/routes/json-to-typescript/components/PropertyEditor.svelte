<script lang="ts">
	import { Checkbox } from '$lib/shared/components/ui';
	import type { InterfaceInfo } from './utils';

	interface Props {
		interfaces: InterfaceInfo[];
		optionalMap: Record<string, boolean>;
		outputMode: 'interface' | 'type';
		onOptionalChange: (path: string, value: boolean) => void;
	}

	let { interfaces, optionalMap, outputMode, onOptionalChange }: Props = $props();

	// Track expanded state - use $state for reactivity
	let expandedInterfaces = $state<Record<string, boolean>>({});

	function toggleInterface(name: string) {
		const current = expandedInterfaces[name] ?? true;
		expandedInterfaces = { ...expandedInterfaces, [name]: !current };
	}

	function isExpanded(name: string): boolean {
		return expandedInterfaces[name] ?? true;
	}

	function handleCheckboxChange(path: string, event: Event) {
		const target = event.target as HTMLInputElement;
		onOptionalChange(path, target.checked);
	}
</script>

<div class="custom-scrollbar h-full overflow-auto bg-white dark:bg-slate-800">
	{#if interfaces.length === 0}
		<div class="flex h-full items-center justify-center text-sm text-gray-400 dark:text-slate-500">
			<div class="text-center">
				<svg
					class="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-slate-600"
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
				<p>Paste JSON to see properties</p>
			</div>
		</div>
	{:else}
		<div class="divide-y divide-gray-100 dark:divide-slate-700">
			{#each interfaces as iface (iface.name)}
				<!-- Interface Block -->
				<div class="bg-white dark:bg-slate-800">
					<!-- Interface Header -->
					<button
						type="button"
						onclick={() => toggleInterface(iface.name)}
						class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
					>
						<svg
							class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-slate-500 {isExpanded(
								iface.name
							)
								? 'rotate-90'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span class="font-mono text-sm">
							<span class="text-blue-600 dark:text-blue-400">{outputMode}</span>
							<span class="ml-1 font-semibold text-gray-900 dark:text-white">{iface.name}</span>
							{#if outputMode === 'type'}
								<span class="text-gray-500 dark:text-slate-400"> =</span>
							{/if}
						</span>
						<span
							class="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-700 dark:text-slate-300"
						>
							{iface.properties.length}
						</span>
					</button>

					<!-- Properties List -->
					{#if isExpanded(iface.name)}
						<div
							class="border-t border-gray-100 bg-gray-50/50 dark:border-slate-700 dark:bg-slate-900/30"
						>
							<table class="w-full">
								<thead>
									<tr
										class="border-b border-gray-100 text-xs tracking-wider text-gray-500 uppercase dark:border-slate-700 dark:text-slate-400"
									>
										<th class="px-4 py-2 text-left font-medium">Property</th>
										<th class="px-4 py-2 text-left font-medium">Type</th>
										<th class="px-4 py-2 text-center font-medium">Optional</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100 dark:divide-slate-700/50">
									{#each iface.properties as prop (prop.path)}
										<tr class="transition-colors hover:bg-white dark:hover:bg-slate-800">
											<td class="px-4 py-2.5">
												<span
													class="font-mono text-sm font-medium text-gray-800 dark:text-slate-200"
												>
													{prop.key}
												</span>
											</td>
											<td class="px-4 py-2.5">
												<span class="font-mono text-sm text-purple-600 dark:text-purple-400">
													{prop.type}
												</span>
											</td>
											<td class="px-4 py-2.5 text-center">
												<label class="inline-flex cursor-pointer items-center gap-2">
													<Checkbox
														checked={optionalMap[prop.path] ?? false}
														onchange={(e) => handleCheckboxChange(prop.path, e)}
														ariaLabel="Make {prop.key} optional"
													/>
													<span class="text-xs text-gray-500 dark:text-slate-400">
														{optionalMap[prop.path] ? '?' : ''}
													</span>
												</label>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
