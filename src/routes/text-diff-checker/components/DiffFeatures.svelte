<script lang="ts">
	const features = [
		{
			icon: 'columns',
			title: 'Side-by-Side View',
			description: 'Compare files with clear visual separation and line-by-line alignment.',
			color: 'blue'
		},
		{
			icon: 'highlight',
			title: 'Character-Level Diff',
			description: 'See exactly what changed within each line with precise highlighting.',
			color: 'purple'
		},
		{
			icon: 'upload',
			title: 'Drag & Drop Files',
			description: 'Upload .txt, .md, .json, .xml, .js, .py and many more file formats.',
			color: 'green'
		},
		{
			icon: 'settings',
			title: 'Smart Options',
			description: 'Ignore whitespace, toggle character diff, and choose output format.',
			color: 'amber'
		},
		{
			icon: 'copy',
			title: 'Copy Results',
			description: 'Export diff results in unified or side-by-side format with one click.',
			color: 'rose'
		},
		{
			icon: 'code',
			title: 'Syntax Highlighting',
			description: 'Code-aware highlighting for better readability of source files.',
			color: 'cyan'
		}
	];

	const colorMap: Record<
		string,
		{
			bg: string;
			icon: string;
			border: string;
			darkBg: string;
			darkIcon: string;
			darkBorder: string;
		}
	> = {
		blue: {
			bg: 'bg-blue-50',
			icon: 'text-blue-600',
			border: 'border-blue-100',
			darkBg: 'dark:bg-blue-950/40',
			darkIcon: 'dark:text-blue-400',
			darkBorder: 'dark:border-blue-900/50'
		},
		purple: {
			bg: 'bg-purple-50',
			icon: 'text-purple-600',
			border: 'border-purple-100',
			darkBg: 'dark:bg-purple-950/40',
			darkIcon: 'dark:text-purple-400',
			darkBorder: 'dark:border-purple-900/50'
		},
		green: {
			bg: 'bg-green-50',
			icon: 'text-green-600',
			border: 'border-green-100',
			darkBg: 'dark:bg-green-950/40',
			darkIcon: 'dark:text-green-400',
			darkBorder: 'dark:border-green-900/50'
		},
		amber: {
			bg: 'bg-amber-50',
			icon: 'text-amber-600',
			border: 'border-amber-100',
			darkBg: 'dark:bg-amber-950/40',
			darkIcon: 'dark:text-amber-400',
			darkBorder: 'dark:border-amber-900/50'
		},
		rose: {
			bg: 'bg-rose-50',
			icon: 'text-rose-600',
			border: 'border-rose-100',
			darkBg: 'dark:bg-rose-950/40',
			darkIcon: 'dark:text-rose-400',
			darkBorder: 'dark:border-rose-900/50'
		},
		cyan: {
			bg: 'bg-cyan-50',
			icon: 'text-cyan-600',
			border: 'border-cyan-100',
			darkBg: 'dark:bg-cyan-950/40',
			darkIcon: 'dark:text-cyan-400',
			darkBorder: 'dark:border-cyan-900/50'
		}
	};
</script>

<div class="mt-12">
	<div class="mb-8 text-center">
		<h2 class="text-2xl font-bold text-white">Powerful Diff Features</h2>
		<p class="mt-2 text-slate-300">Everything you need to compare text and code efficiently</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each features as feature}
			{@const colors = colorMap[feature.color]}
			<div
				class="group flex gap-4 rounded-xl border {colors.border} {colors.darkBorder} {colors.bg} {colors.darkBg} p-5 transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
			>
				<div
					class="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800 dark:shadow-slate-900/30"
				>
					{#if feature.icon === 'columns'}
						<svg
							class="h-5 w-5 {colors.icon} {colors.darkIcon}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
							/>
						</svg>
					{:else if feature.icon === 'highlight'}
						<svg
							class="h-5 w-5 {colors.icon} {colors.darkIcon}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					{:else if feature.icon === 'upload'}
						<svg
							class="h-5 w-5 {colors.icon} {colors.darkIcon}"
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
					{:else if feature.icon === 'settings'}
						<svg
							class="h-5 w-5 {colors.icon} {colors.darkIcon}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							/>
						</svg>
					{:else if feature.icon === 'copy'}
						<svg
							class="h-5 w-5 {colors.icon} {colors.darkIcon}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
					{:else if feature.icon === 'code'}
						<svg
							class="h-5 w-5 {colors.icon} {colors.darkIcon}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							/>
						</svg>
					{/if}
				</div>
				<div>
					<h3 class="font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
					<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
